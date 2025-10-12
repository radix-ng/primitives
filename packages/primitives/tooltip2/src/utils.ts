import { DestroyRef } from '@angular/core';

export type TimeoutController = {
    start: () => void;
    stop: () => void;
    isPending: () => boolean;
};

export function useTimeoutFn(
    cb: () => void,
    delay: number | (() => number),
    options: { immediate?: boolean } = {},
    destroyRef?: DestroyRef
): TimeoutController {
    let id: number | null = null;

    const resolveDelay = () => (typeof delay === 'function' ? (delay as () => number)() : delay);

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
