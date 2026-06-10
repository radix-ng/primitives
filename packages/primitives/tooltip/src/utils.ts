import { DestroyRef, signal, Signal } from '@angular/core';

export type TimeoutController = {
    start: () => void;
    stop: () => void;
    isPending: () => boolean;
};

export type TooltipInstantController = {
    /** Whether the next tooltip in the group should open without waiting for the delay. */
    isInstant: Signal<boolean>;
    /** Call when a tooltip opens — leaves the group in the instant phase. */
    onOpen: () => void;
    /** Call when a tooltip closes — keeps the group instant for `timeout` ms, then re-arms the delay. */
    onClose: () => void;
};

/**
 * Tracks the shared "instant" window for a group of tooltips. Once one tooltip
 * opens, sibling tooltips open instantly until `timeout` ms after the last close.
 */
export function createTooltipInstantController(
    timeout: () => number,
    destroyRef?: DestroyRef
): TooltipInstantController {
    const instant = signal(false);

    const timer = useTimeoutFn(() => instant.set(false), timeout, { immediate: false }, destroyRef);

    return {
        isInstant: instant.asReadonly(),
        onOpen: () => {
            timer.stop();
            instant.set(true);
        },
        onClose: () => {
            timer.start();
        }
    };
}

export function useTimeoutFn(
    cb: () => void,
    delay: number | (() => number),
    options: { immediate?: boolean } = {},
    destroyRef?: DestroyRef
): TimeoutController {
    let id: number | null = null;

    const resolveDelay = () => (typeof delay === 'function' ? delay() : delay);

    const stop = () => {
        if (id != null) {
            clearTimeout(id);
            id = null;
        }
    };

    const start = () => {
        stop();
        const ms = resolveDelay();
        if (ms <= 0) {
            queueMicrotask(cb);
            return;
        }
        id = window.setTimeout(() => {
            id = null;
            cb();
        }, ms);
    };

    if (options.immediate) {
        start();
    }
    if (destroyRef) {
        destroyRef.onDestroy(stop);
    }

    return { start, stop, isPending: () => id != null };
}
