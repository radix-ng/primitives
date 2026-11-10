import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTransitionStatus } from '../src/composables/use-transition-status';
import { usePopupLifecycle } from '../src/floating/use-popup-lifecycle';

@Component({ template: '' })
class Host {
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

    it('completes an automatic close once and ignores later unmount actions', async () => {
        change(true);
        await settle();
        change(false);
        await settle();
        expect(closedCompletions()).toEqual([false]);
        host.lifecycle.unmount();
        await settle();
        expect(closedCompletions()).toEqual([false]);
    });

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
        expect(host.completions).toEqual([true, false]);
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
        expect(closedCompletions()).toEqual([]);
        mounted.set(false);
        await settle();
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
        expect(closedCompletions()).toEqual([false]);
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
        expect(closedCompletions()).toEqual([false]);
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
        expect(closedCompletions()).toEqual([false, false]);
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
        const transition = TestBed.runInInjectionContext(() => useTransitionStatus((open) => completions.push(open)));
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
