import { afterNextRender, DestroyRef, inject, Injector, signal, Signal } from '@angular/core';

/**
 * Lifecycle phase of an open/close transition.
 *
 * - `'starting'` — the part has just mounted/opened; the enter animation is about to run.
 * - `'ending'`   — the part is closing; the exit animation is running.
 * - `undefined`  — settled (no transition in progress).
 */
export type RdxTransitionStatus = 'starting' | 'ending' | undefined;

export interface RdxTransitionStatusRef {
    /** Reactive transition phase, intended for `data-starting-style` / `data-ending-style` bindings. */
    readonly status: Signal<RdxTransitionStatus>;
    /**
     * Registers the element whose CSS transition/animation duration determines when the close
     * transition is considered complete. Returns a cleanup that unregisters it.
     */
    registerElement: (element: HTMLElement) => () => void;
    /** Drives a new transition for the given open state. Cancels any in-flight transition. */
    start: (open: boolean) => void;
}

/**
 * Shared open/close transition state machine used by overlay primitives (dialog, popover, …).
 *
 * On `start(open)` it flips `status` to `'starting'`/`'ending'`, then — after the next render and
 * (for opening) one animation frame — clears it and waits for the registered element's longest CSS
 * transition/animation to finish before invoking `onComplete(open)`. If no element is registered or
 * it has no animation, completion is synchronous on the next render.
 *
 * Must be called in an injection context (uses {@link Injector} and {@link DestroyRef}).
 */
export function useTransitionStatus(onComplete: (open: boolean) => void): RdxTransitionStatusRef {
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);
    const status = signal<RdxTransitionStatus>(undefined);

    let element: HTMLElement | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame: number | undefined;
    let version = 0;

    const clearTimers = () => {
        if (frame !== undefined) {
            cancelAnimationFrame(frame);
            frame = undefined;
        }

        if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
        }
    };

    const complete = (open: boolean, currentVersion: number) => {
        if (currentVersion !== version) {
            return;
        }

        clearTimers();
        status.set(undefined);

        if (!destroyRef.destroyed) {
            onComplete(open);
        }
    };

    const waitForTransition = (open: boolean, currentVersion: number) => {
        const duration = element ? getMaxTransitionDuration(element) : 0;

        if (duration === 0) {
            complete(open, currentVersion);
            return;
        }

        timer = setTimeout(() => complete(open, currentVersion), duration);
    };

    destroyRef.onDestroy(clearTimers);

    return {
        status: status.asReadonly(),
        registerElement: (registered: HTMLElement) => {
            element = registered;

            return () => {
                if (element === registered) {
                    element = undefined;
                }
            };
        },
        start: (open: boolean) => {
            const currentVersion = ++version;
            clearTimers();
            status.set(open ? 'starting' : 'ending');

            afterNextRender(
                () => {
                    if (destroyRef.destroyed || currentVersion !== version) {
                        return;
                    }

                    if (open) {
                        frame = requestAnimationFrame(() => {
                            frame = undefined;

                            if (destroyRef.destroyed || currentVersion !== version) {
                                return;
                            }

                            status.set(undefined);
                            waitForTransition(open, currentVersion);
                        });
                    } else {
                        waitForTransition(open, currentVersion);
                    }
                },
                { injector }
            );
        }
    };
}

/** Longest of an element's CSS transition / animation durations (including delays), in milliseconds. */
export function getMaxTransitionDuration(element: HTMLElement): number {
    const styles = getComputedStyle(element);

    return Math.max(
        getMaxCssDuration(styles.transitionDuration, styles.transitionDelay),
        getMaxCssDuration(styles.animationDuration, styles.animationDelay)
    );
}

function getMaxCssDuration(durations: string, delays: string): number {
    const parsedDurations = durations.split(',').map(parseCssTime);
    const parsedDelays = delays.split(',').map(parseCssTime);

    return parsedDurations.reduce(
        (max, duration, index) => Math.max(max, duration + parsedDelays[index % parsedDelays.length]),
        0
    );
}

function parseCssTime(value: string): number {
    const trimmed = value.trim();
    const parsed = Number.parseFloat(trimmed);

    if (!Number.isFinite(parsed)) {
        return 0;
    }

    return trimmed.endsWith('ms') ? parsed : parsed * 1000;
}
