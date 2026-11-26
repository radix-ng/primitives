import { DestroyRef, signal, Signal } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';

export function createTooltipTimer(destroyRef: DestroyRef) {
    let id: ReturnType<typeof setTimeout> | undefined;

    const stop = () => {
        if (id !== undefined) {
            clearTimeout(id);
            id = undefined;
        }
    };

    destroyRef.onDestroy(stop);

    return {
        start(callback: () => void, delay: number): void {
            stop();
            if (destroyRef.destroyed) return;

            id = setTimeout(() => {
                id = undefined;
                callback();
            }, delay);
        },
        stop
    };
}

export type TooltipInstantController = {
    isInstant: Signal<boolean>;
    onOpen: (closeForSibling: () => void) => void;
    onClose: (closeForSibling: () => void) => void;
};

/** The most recently opened tooltip owns the provider's instant window. */
export function createTooltipInstantController(
    timeout: Signal<number>,
    destroyRef: DestroyRef
): TooltipInstantController {
    const instant = signal(false);
    const timer = createTooltipTimer(destroyRef);
    let activeTooltip: (() => void) | undefined;
    let isClosing = false;

    function reset(): void {
        activeTooltip = undefined;
        isClosing = false;
        instant.set(false);
    }

    function resetAfterTimeout(delay: number): void {
        if (delay > 0) {
            timer.start(reset, delay);
        } else {
            timer.stop();
            reset();
        }
    }

    watch([timeout], ([delay]) => {
        if (isClosing) resetAfterTimeout(delay);
    });

    return {
        isInstant: instant.asReadonly(),
        onOpen(closeForSibling): void {
            const previous = activeTooltip;
            timer.stop();
            activeTooltip = closeForSibling;
            isClosing = false;
            instant.set(true);

            if (previous !== closeForSibling) previous?.();
        },
        onClose(closeForSibling): void {
            if (activeTooltip !== closeForSibling) return;

            isClosing = true;
            resetAfterTimeout(timeout());
        }
    };
}
