import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RdxToastContent } from '../src/toast-content';
import { RdxToastDescription } from '../src/toast-description';
import { RdxToastManager } from '../src/toast-provider';
import { RdxToastRoot } from '../src/toast-root';
import { RdxToastTitle } from '../src/toast-title';
import { RdxToastViewport } from '../src/toast-viewport';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'test-toast-host',
    template: `
        <div rdxToastViewport>
            @for (toast of toasts(); track toast.id) {
                <div [toast]="toast" rdxToastRoot>
                    <div rdxToastContent>
                        @if (toast.title) {
                            <p rdxToastTitle>{{ toast.title }}</p>
                        }
                        @if (toast.description) {
                            <p rdxToastDescription>{{ toast.description }}</p>
                        }
                    </div>
                </div>
            }
        </div>
    `,
    imports: [RdxToastViewport, RdxToastRoot, RdxToastContent, RdxToastTitle, RdxToastDescription]
})
class TestHostComponent {
    private readonly manager = inject(RdxToastManager);
    readonly toasts = this.manager.toasts;
}

describe('RdxToastManager', () => {
    let manager: RdxToastManager;

    beforeEach(() => {
        vi.stubGlobal(
            'ResizeObserver',
            class {
                observe(): void {}
                disconnect(): void {}
            }
        );
        TestBed.configureTestingModule({
            providers: [RdxToastManager]
        });
        manager = TestBed.inject(RdxToastManager);
    });

    afterEach(() => vi.unstubAllGlobals());

    it('adds a toast and returns a stable id', () => {
        const id = manager.add({ title: 'Saved', timeout: 0 });
        expect(typeof id).toBe('string');
        expect(manager.toasts().some((t) => t.id === id)).toBe(true);
    });

    it('honors a caller-supplied id and updates in place', () => {
        manager.add({ id: 'fixed', title: 'Old', timeout: 0 });
        manager.update('fixed', { title: 'New' });
        const toast = manager.toasts().find((t) => t.id === 'fixed');
        expect(toast?.title).toBe('New');
        expect(manager.toasts().filter((t) => t.id === 'fixed').length).toBe(1);
    });

    it('marks a toast as ending when closed', () => {
        const id = manager.add({ title: 'Bye', timeout: 0 });
        manager.close(id);
        expect(manager.toasts().find((t) => t.id === id)?.transitionStatus).toBe('ending');
    });

    it('closes every toast when called without an id', () => {
        manager.add({ id: 'a', title: 'A', timeout: 0 });
        manager.add({ id: 'b', title: 'B', timeout: 0 });
        manager.close();
        expect(manager.toasts().every((t) => t.transitionStatus === 'ending')).toBe(true);
    });

    it('removes a toast from the queue', () => {
        const id = manager.add({ title: 'Gone', timeout: 0 });
        manager.remove(id);
        expect(manager.toasts().some((t) => t.id === id)).toBe(false);
    });

    it('recomputes the visible stack after closing or changing the limit', () => {
        manager.limit = 2;
        manager.add({ id: 'a', title: 'A', timeout: 0 });
        manager.add({ id: 'b', title: 'B', timeout: 0 });
        manager.add({ id: 'c', title: 'C', timeout: 0 });
        const limitedIds = () =>
            manager
                .toasts()
                .filter((toast) => toast.limited)
                .map((toast) => toast.id);
        expect(limitedIds()).toEqual(['a']);

        manager.limit = 1;
        expect(limitedIds()).toEqual(['a', 'b']);
        manager.close('c');
        expect(limitedIds()).toEqual(['a']);
        expect(manager.layout().b.index).toBe(0);
        manager.limit = 2;
        expect(limitedIds()).toEqual([]);
    });

    it('renders queued toasts through the viewport host component', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        manager.add({ title: 'Hello', timeout: 0 });
        fixture.detectChanges();
        const root = fixture.nativeElement.querySelector('[rdxToastRoot]');
        expect(root).toBeTruthy();
        expect(root.hasAttribute('data-starting-style')).toBe(true);
        expect(root.getAttribute('role')).toBe('dialog');
    });

    it('exposes stack index on Root and behind state on Content', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        manager.add({ id: 'old', title: 'Old', timeout: 0 });
        manager.add({ id: 'new', title: 'New', timeout: 0 });
        fixture.detectChanges();

        const roots = fixture.nativeElement.querySelectorAll('[rdxToastRoot]');
        // Rendered oldest-first; the newest is the front of the stack (index 0).
        const oldEl = roots[0] as HTMLElement;
        const newEl = roots[1] as HTMLElement;
        expect(oldEl.style.getPropertyValue('--toast-index')).toBe('1');
        expect(newEl.style.getPropertyValue('--toast-index')).toBe('0');
        expect(oldEl.querySelector('[rdxToastContent]')).toHaveAttribute('data-behind');
        expect(newEl.querySelector('[rdxToastContent]')).not.toHaveAttribute('data-behind');
    });

    it('toggles expanded state on the manager', () => {
        expect(manager.expanded()).toBe(false);
        manager.setExpanded(true);
        expect(manager.expanded()).toBe(true);
    });

    it('keeps timers paused until every hold releases (nested pause depth)', () => {
        vi.useFakeTimers();
        try {
            const id = manager.add({ title: 'Pinned', timeout: 1000 });
            manager.pauseAll(); // hover
            manager.pauseAll(); // swipe
            manager.resumeAll(); // swipe released; still hovered
            vi.advanceTimersByTime(2000);
            expect(manager.toasts().find((t) => t.id === id)?.transitionStatus).toBe('starting');
            manager.resumeAll(); // hover released
            vi.advanceTimersByTime(2000);
            expect(manager.toasts().find((t) => t.id === id)?.transitionStatus).toBe('ending');
        } finally {
            vi.useRealTimers();
        }
    });

    it('keeps the limited toast and calls onRemove only when it actually leaves the queue', () => {
        manager.limit = 1;
        const onRemove = vi.fn();
        manager.add({ id: 'a', title: 'A', timeout: 0, onRemove });
        manager.add({ id: 'b', title: 'B', timeout: 0 });
        expect(onRemove).not.toHaveBeenCalled();
        expect(manager.toasts()).toMatchObject([{ id: 'a', limited: true }, { id: 'b' }]);
        manager.close('b');
        expect(manager.toasts()[0].limited).toBe(false);
        manager.remove('a');
        expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('finishes an abandoned dismissal when the same id is re-added mid-leave', () => {
        const onRemove = vi.fn();
        const id = manager.add({ id: 'x', title: 'Old', timeout: 0, onRemove });
        manager.close(id); // now ending, leave animation in flight
        expect(manager.toasts().find((t) => t.id === id)?.transitionStatus).toBe('ending');

        manager.add({ id: 'x', title: 'New', timeout: 0 }); // resurrect before animationend
        // The abandoned toast's onRemove fired, and the queue holds the fresh, open toast.
        expect(onRemove).toHaveBeenCalledTimes(1);
        const toast = manager.toasts().find((t) => t.id === 'x');
        expect(toast?.title).toBe('New');
        expect(toast?.transitionStatus).toBe('starting');
    });

    it('only sets aria-labelledby / aria-describedby when the parts are rendered', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        manager.add({ id: 'titled', title: 'Only a title', timeout: 0 });
        fixture.detectChanges();

        const root = fixture.nativeElement.querySelector('[rdxToastRoot]');
        expect(root.getAttribute('aria-labelledby')).toBeTruthy();
        expect(root.getAttribute('aria-describedby')).toBeNull();
    });

    it('[WCAG 4.1.2] names the live region and the rendered notification dialog', async () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        manager.add({ title: 'Saved', description: 'The project was saved', timeout: 0 });
        fixture.detectChanges();

        const viewport = fixture.nativeElement.querySelector('[rdxToastViewport]');
        expect(viewport).toHaveAccessibleName('Notifications');
        expect(viewport).toHaveAttribute('aria-live', 'polite');
        const root = viewport.querySelector('[rdxToastRoot]');
        expect(root).toHaveAccessibleName('Saved');
        expect(root).toHaveAccessibleDescription('The project was saved');
        expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });

    it('commits close before callbacks and ignores repeated requests and late updates', () => {
        const onClose = vi.fn(() => manager.close('toast'));
        manager.add({ id: 'toast', title: 'Saved', timeout: 0, onClose });
        manager.close();
        manager.update('toast', { title: 'Updated' });
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(manager.toasts()[0]).toMatchObject({ title: 'Saved', transitionStatus: 'ending' });
    });

    it('preserves time remaining on a copy update and honors explicit timeout changes', () => {
        vi.useFakeTimers();
        try {
            const id = manager.add({ title: 'Original', timeout: 1000 });
            vi.advanceTimersByTime(750);
            manager.update(id, { title: 'Updated' });
            vi.advanceTimersByTime(249);
            expect(manager.toasts()[0].transitionStatus).toBe('starting');
            vi.advanceTimersByTime(1);
            expect(manager.toasts()[0].transitionStatus).toBe('ending');

            manager.add({ id, timeout: 1000 });
            manager.update(id, { timeout: 0 });
            vi.advanceTimersByTime(1000);
            expect(manager.toasts()[0].transitionStatus).toBe('starting');
        } finally {
            vi.useRealTimers();
        }
    });

    it('preserves time remaining while the viewport window is blurred', () => {
        vi.useFakeTimers();
        try {
            const fixture = TestBed.createComponent(TestHostComponent);
            fixture.detectChanges();
            manager.add({ title: 'Saved', timeout: 1000 });
            vi.advanceTimersByTime(750);

            window.dispatchEvent(new FocusEvent('blur'));
            fixture.detectChanges();
            vi.advanceTimersByTime(1000);
            expect(manager.toasts()[0].transitionStatus).not.toBe('ending');

            window.dispatchEvent(new FocusEvent('focus'));
            fixture.detectChanges();
            vi.advanceTimersByTime(250);
            expect(manager.toasts()[0].transitionStatus).toBe('ending');
        } finally {
            vi.useRealTimers();
        }
    });

    it('honors the result timeout and provider default when a promise settles', async () => {
        vi.useFakeTimers();
        try {
            manager.defaultTimeout = 250;
            await manager.promise(Promise.resolve('report'), {
                loading: { id: 'success' },
                success: (value) => ({ title: value, timeout: 0 }),
                error: 'Failed'
            });
            const error = new Error('timeout');
            await expect(
                manager.promise(Promise.reject(error), {
                    loading: { id: 'error' },
                    success: 'Saved',
                    error: 'Failed'
                })
            ).rejects.toBe(error);
            expect(manager.toasts()).toMatchObject([
                { title: 'report', type: 'success' },
                { title: 'Failed', type: 'error' }
            ]);
            vi.advanceTimersByTime(250);
            expect(manager.toasts().map((toast) => toast.transitionStatus)).toEqual(['starting', 'ending']);
        } finally {
            vi.useRealTimers();
        }
    });
});
