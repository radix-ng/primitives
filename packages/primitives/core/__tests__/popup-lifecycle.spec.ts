import { Component, OnDestroy, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRenderLifecycle } from '../src/composables/use-render-lifecycle';
import { usePopupLifecycle } from '../src/floating/use-popup-lifecycle';

@Component({ template: '' })
class Host implements OnDestroy {
    readonly open = signal(false);
    readonly completions: boolean[] = [];
    readonly lifecycle = usePopupLifecycle(this.open, (open) => {
        this.completions.push(open);
        if (!open && this.reopenOnComplete) {
            this.reopenOnComplete = false;
            this.open.set(true);
        }
    });
    reopenOnComplete = false;
    ngOnDestroy() {
        this.lifecycle.finishPendingCloseOnDestroy();
    }
}

describe('shared popup lifecycle', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;
    const closedCompletions = () => host.completions.filter((open) => !open);
    const settle = async () => {
        await fixture.whenStable();
    };
    function change(open: boolean, defer = false, cancel = false) {
        const transaction = host.lifecycle.prepareOpenChange(open);
        if (defer) transaction.preventUnmountOnClose();
        if (!cancel) {
            host.open.set(open);
            transaction.commit();
        }
        return transaction;
    }

    beforeEach(async () => {
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    });

    it('waits for a suspended Portal destination and completes each actual remount', async () => {
        const suspended = signal(true);
        const mounted = signal(false);
        host.lifecycle.registerPresence({ mounted, keepMounted: () => false, suspended });
        change(true);
        await settle();
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        expect(host.completions).toEqual([]);
        suspended.set(false);
        mounted.set(true);
        await settle();
        await vi.waitFor(() => expect(host.completions).toEqual([true]));
        suspended.set(true);
        mounted.set(false);
        await settle();
        suspended.set(false);
        mounted.set(true);
        await settle();
        await vi.waitFor(() => expect(host.completions).toEqual([true, true]));
        expect(host.open()).toBe(true);
    });

    it('does not report a completed close when the Portal was still waiting for a destination', async () => {
        host.lifecycle.registerPresence({ mounted: signal(false), keepMounted: () => false, suspended: signal(true) });
        change(true);
        await settle();
        change(false);
        await settle();
        expect(host.completions).toEqual([]);
        expect(host.lifecycle.present()).toBe(false);
        expect(host.lifecycle.status()).toBeUndefined();
    });

    it.each(['automatic', 'deferred', 'css', 'retained-css'] as const)(
        'owner destruction completes only an accepted automatic close: %s',
        async (mode) => {
            change(true);
            await settle();
            await vi.waitFor(() => expect(host.completions).toEqual([true]));
            host.lifecycle.registerPresence({
                mounted: signal(true),
                keepMounted: () => mode === 'retained-css',
                pendingExit: () => mode === 'css'
            });
            if (mode === 'retained-css') {
                const element = document.createElement('div');
                element.style.animationDuration = '10s';
                host.lifecycle.registerElement(element);
            }
            change(false, mode === 'deferred');
            if (mode === 'retained-css') await settle();
            fixture.destroy();
            expect(host.completions).toEqual(mode === 'automatic' ? [true, false] : [true]);
        }
    );

    it('completes an automatic close once and ignores later unmount actions', async () => {
        change(true);
        await settle();
        change(false);
        await settle();
        await vi.waitFor(() => expect(closedCompletions()).toEqual([false]));
        host.lifecycle.unmount();
        await settle();
        await vi.waitFor(() => expect(closedCompletions()).toEqual([false]));
    });

    it.each([false, true])(
        'can reopen a rendered close before its completion frame (retained: %s)',
        async (keepMounted) => {
            change(true);
            await settle();
            await vi.waitFor(() => expect(host.completions).toEqual([true]));
            const mounted = signal(true);
            host.lifecycle.registerPresence({ mounted, keepMounted: () => keepMounted });
            const frames: FrameRequestCallback[] = [];
            const request = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
                frames.push(callback);
                return 100_000 + frames.length;
            });
            try {
                change(false);
                if (!keepMounted) mounted.set(false);
                await settle();
                expect(closedCompletions()).toEqual([]);
                change(true);
                mounted.set(true);
                await settle();
                // Even a stale callback from the interrupted close cannot complete that close.
                for (const frame of frames.splice(0)) frame(performance.now());
                await settle();
                expect(closedCompletions()).toEqual([]);
                expect(host.completions).toEqual([true, true]);
                expect(host.open()).toBe(true);
            } finally {
                request.mockRestore();
            }
        }
    );

    it.each([false, true])(
        'completes a finished exit before native focus starts a new enter (retained: %s)',
        async (keepMounted) => {
            const mounted = signal(true);
            host.lifecycle.registerPresence({ mounted, keepMounted: () => keepMounted });
            change(true);
            await settle();
            await vi.waitFor(() => expect(host.completions).toEqual([true]));
            const frames: FrameRequestCallback[] = [];
            const request = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
                frames.push(callback);
                return 100_000 + frames.length;
            });
            try {
                change(false);
                if (!keepMounted) mounted.set(false);
                await settle();
                expect(closedCompletions()).toEqual([]);
                expect(host.lifecycle.status()).toBeUndefined();
                const reopen = host.lifecycle.prepareOpenChange(true, new FocusEvent('focusin'));
                expect(closedCompletions()).toEqual([false]);
                host.open.set(true);
                reopen.commit();
                await settle();
                for (const frame of frames.splice(0)) frame(performance.now());
                await settle();
                expect(host.completions).toEqual([true, false, true]);
            } finally {
                request.mockRestore();
            }
        }
    );

    it.each(['presence', 'deferred', 'css'] as const)(
        'does not complete an unfinished %s exit when native focus reopens it',
        async (mode) => {
            const mounted = signal(true);
            host.lifecycle.registerPresence({ mounted, keepMounted: () => mode === 'css' });
            change(true);
            await settle();
            await vi.waitFor(() => expect(host.completions).toEqual([true]));
            if (mode === 'css') {
                const element: HTMLElement = fixture.nativeElement;
                element.style.animationDuration = '10s';
                host.lifecycle.registerElement(element);
            }
            change(false, mode === 'deferred');
            if (mode === 'deferred') mounted.set(false);
            await settle();
            expect(host.lifecycle.status()).toBe('ending');
            const reopen = host.lifecycle.prepareOpenChange(true, new FocusEvent('focusin'));
            host.open.set(true);
            reopen.commit();
            mounted.set(true);
            await settle();
            expect(closedCompletions()).toEqual([]);
        }
    );

    it('does not replay an enter completion when a close reopens before render', async () => {
        change(true);
        await settle();
        await vi.waitFor(() => expect(host.completions).toEqual([true]));
        const close = change(false, true);
        change(true);
        await settle();
        close.preventUnmountOnClose();
        expect(host.lifecycle.present()).toBe(true);
        expect(host.lifecycle.status()).toBeUndefined();
        expect(host.completions).toEqual([true]);
        change(false);
        await settle();
        await vi.waitFor(() => expect(host.completions).toEqual([true, false]));
    });

    it('preserves an unfinished enter when a close reopens before render', async () => {
        let finishAnimation!: () => void;
        const finished = new Promise<void>((resolve) => {
            finishAnimation = resolve;
        });
        const element: HTMLElement = fixture.nativeElement;
        element.style.transitionDuration = '1s';
        const getAnimations = vi.fn(() => [{ finished }]);
        Object.defineProperty(element, 'getAnimations', { value: getAnimations });
        host.lifecycle.registerElement(element);
        change(true);
        await settle();
        await vi.waitFor(() => expect(getAnimations).toHaveBeenCalledOnce());
        expect(host.completions).toEqual([]);
        change(false);
        change(true);
        await settle();
        finishAnimation();
        await vi.waitFor(() => expect(host.completions).toEqual([true]));
        expect(host.lifecycle.status()).toBeUndefined();
    });

    it('starts another enter completion when a close survives the native-event microtask boundary', async () => {
        change(true);
        await settle();
        await vi.waitFor(() => expect(host.completions).toEqual([true]));
        change(false, true);
        await Promise.resolve();
        change(true);
        await settle();
        await vi.waitFor(() => expect(host.completions).toEqual([true, true]));
    });

    it('holds the closing phase until manual completion, including a batched close/unmount', async () => {
        change(true);
        await settle();
        change(false, true);
        await settle();
        expect(host.lifecycle.present()).toBe(true);
        expect(host.lifecycle.status()).toBe('ending');
        expect(closedCompletions()).toEqual([]);
        host.lifecycle.unmount();
        host.lifecycle.unmount();
        await settle();
        expect(host.lifecycle.present()).toBe(false);
        expect(host.lifecycle.status()).toBeUndefined();
        expect(closedCompletions()).toEqual([false]);

        change(true);
        await settle();
        change(false, true);
        host.lifecycle.unmount();
        await settle();
        expect(closedCompletions()).toEqual([false, false]);
    });

    it('waits for the registered presence to remove the live view', async () => {
        const mounted = signal(true);
        host.lifecycle.registerPresence({ mounted, keepMounted: () => false });
        change(true);
        await settle();
        change(false);
        await settle();
        expect(host.lifecycle.status()).toBe('ending');
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        expect(closedCompletions()).toEqual([]);
        mounted.set(false);
        await settle();
        // The frame already passed while Presence was exiting; completion needs no extra frame.
        expect(closedCompletions()).toEqual([false]);
    });

    it('finishes a keep-mounted close without requiring DOM removal', async () => {
        const mounted = signal(true);
        host.lifecycle.registerPresence({ mounted, keepMounted: () => true });
        change(true);
        await settle();
        change(false, true);
        await settle();
        host.lifecycle.unmount();
        await settle();
        expect(mounted()).toBe(true);
        expect(closedCompletions()).toEqual([false]);
    });

    it('does not commit a canceled opt-out or an opt-out requested while opening', async () => {
        change(true, true);
        await settle();
        const canceled = change(false, true, true);
        canceled.preventUnmountOnClose();
        expect(host.open()).toBe(true);
        change(false);
        await settle();
        expect(host.lifecycle.present()).toBe(false);
        await vi.waitFor(() => expect(closedCompletions()).toEqual([false]));
    });

    it('accepts a late opt-out only for its still-pending close', async () => {
        const mounted = signal(true);
        host.lifecycle.registerPresence({ mounted, keepMounted: () => false });
        change(true);
        await settle();
        const close = change(false);
        await settle();
        close.preventUnmountOnClose();
        expect(host.lifecycle.present()).toBe(true);
        host.lifecycle.unmount();
        close.preventUnmountOnClose();
        expect(host.lifecycle.present()).toBe(false);
        mounted.set(false);
        await settle();
        close.preventUnmountOnClose();
        expect(host.lifecycle.present()).toBe(false);
        expect(closedCompletions()).toEqual([false]);
    });

    it('invalidates an old close after reopening and ignores stale unmount calls while open', async () => {
        change(true);
        await settle();
        const oldClose = change(false, true);
        await settle();
        host.open.set(true);
        await settle();
        oldClose.preventUnmountOnClose();
        host.lifecycle.unmount();
        expect(host.open()).toBe(true);
        expect(closedCompletions()).toEqual([]);
        change(false);
        oldClose.preventUnmountOnClose();
        await settle();
        expect(host.lifecycle.present()).toBe(false);
        await vi.waitFor(() => expect(closedCompletions()).toEqual([false]));
    });

    it('supports reopening from the completion handler and a later automatic close', async () => {
        change(true);
        await settle();
        change(false, true);
        await settle();
        host.reopenOnComplete = true;
        host.lifecycle.unmount();
        await settle();
        expect(host.open()).toBe(true);
        expect(host.lifecycle.present()).toBe(true);
        change(false);
        await settle();
        expect(host.lifecycle.present()).toBe(false);
        await vi.waitFor(() => expect(closedCompletions()).toEqual([false, false]));
    });

    it('starts a fresh enter when immediate unmount completion reopens before render', async () => {
        change(true);
        await settle();
        await vi.waitFor(() => expect(host.completions).toEqual([true]));
        host.reopenOnComplete = true;
        change(false);
        host.lifecycle.unmount();
        await settle();
        await vi.waitFor(() => expect(host.completions).toEqual([true, false, true]));
    });

    it('ignores retained callbacks after destruction', async () => {
        change(true);
        await settle();
        const close = change(false, true);
        await settle();
        fixture.destroy();
        close.preventUnmountOnClose();
        host.lifecycle.unmount();
        expect(closedCompletions()).toEqual([]);
    });

    it('cancels the shared CSS wait without notifying or completing a later transition', async () => {
        let finishAnimation: () => void = () => undefined;
        const finished = new Promise<void>((resolve) => {
            finishAnimation = resolve;
        });
        const element: HTMLElement = fixture.nativeElement;
        element.style.transitionDuration = '1s';
        Object.defineProperty(element, 'getAnimations', { value: () => [{ finished }] });
        const completions: boolean[] = [];
        const transition = TestBed.runInInjectionContext(() => useRenderLifecycle((open) => completions.push(open)));
        transition.registerElement(element);
        transition.start(false);
        await settle();
        transition.cancel();
        finishAnimation();
        await Promise.resolve();
        expect(completions).toEqual([]);
        transition.start(false);
        await settle();
        expect(completions).toEqual([false]);
    });
});
