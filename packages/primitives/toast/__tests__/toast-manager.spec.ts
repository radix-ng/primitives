import { RdxToastDescription } from '../src/toast-description';
import { RdxToastManager } from '../src/toast-provider';
import { RdxToastRoot } from '../src/toast-root';
import { RdxToastTitle } from '../src/toast-title';
import { RdxToastViewport } from '../src/toast-viewport';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'test-toast-host',
    template: `
        <div rdxToastViewport>
            @for (toast of toasts(); track toast.id) {
                <div rdxToastRoot [toast]="toast">
                    @if (toast.title) {
                        <p rdxToastTitle>{{ toast.title }}</p>
                    }
                    @if (toast.description) {
                        <p rdxToastDescription>{{ toast.description }}</p>
                    }
                </div>
            }
        </div>
    `,
    imports: [RdxToastViewport, RdxToastRoot, RdxToastTitle, RdxToastDescription]
})
class TestHostComponent {
    private readonly manager = inject(RdxToastManager);
    readonly toasts = this.manager.toasts;
}

describe('RdxToastManager', () => {
    let manager: RdxToastManager;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RdxToastManager]
        });
        manager = TestBed.inject(RdxToastManager);
    });

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

    it('enforces the configured limit, dropping the oldest', () => {
        manager.limit = 2;
        manager.add({ id: 'a', title: 'A', timeout: 0 });
        manager.add({ id: 'b', title: 'B', timeout: 0 });
        manager.add({ id: 'c', title: 'C', timeout: 0 });
        const ids = manager.toasts().map((t) => t.id);
        expect(ids).toEqual(['b', 'c']);
    });

    it('renders queued toasts through the viewport host component', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        manager.add({ title: 'Hello', timeout: 0 });
        fixture.detectChanges();
        const root = fixture.nativeElement.querySelector('[rdxToastRoot]');
        expect(root).toBeTruthy();
        expect(root.getAttribute('data-state')).toBe('open');
        expect(root.getAttribute('role')).toBe('status');
    });

    it('exposes stack index and front marker on rendered roots', () => {
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
        expect(newEl.getAttribute('data-front')).toBe('');
        expect(oldEl.getAttribute('data-front')).toBeNull();
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

    it('fires onRemove for a toast evicted by the limit', () => {
        manager.limit = 1;
        const onRemove = vi.fn();
        manager.add({ id: 'a', title: 'A', timeout: 0, onRemove });
        manager.add({ id: 'b', title: 'B', timeout: 0 });
        expect(onRemove).toHaveBeenCalledTimes(1);
        expect(manager.toasts().map((t) => t.id)).toEqual(['b']);
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
});
