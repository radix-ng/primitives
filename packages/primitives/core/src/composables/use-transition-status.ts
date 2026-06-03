import { afterNextRender, DestroyRef, inject, Injector, Signal, signal } from '@angular/core';

/**
 * Lifecycle phase of an open/close transition.
 *
 * - `'starting'` — the part has just mounted/opened; the enter animation is about to run.
 * - `'ending'`   — the part is closing; the exit animation is running.
 * - `undefined`  — settled (no transition in progress).
 */
export type RdxTransitionStatus = 'starting' | 'ending' | undefined;

/**
 * Grace period (ms) added to an element's declared transition duration before the
 * safety-net timer force-completes a transition. Only matters when the real
 * `animationend`/`transitionend` never arrives (interrupted, replaced without a
 * cancel event, reduced motion, …).
 */
const TRANSITION_FALLBACK_BUFFER = 50;

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
 * (for opening) one animation frame — clears it and waits for the registered element's running CSS
 * animations/transitions to finish (via the Web Animations API) before invoking `onComplete(open)`.
 * Completing on the real `animationend` rather than a duration timer keeps it from firing a frame
 * late. A duration-based timer remains as a safety net, and if no element is registered or it has no
 * animation (also SSR / jsdom, where computed durations are `0`) completion is synchronous.
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
        const node = element;
        const duration = node ? getMaxTransitionDuration(node) : 0;

        // Nothing animating (also the SSR / jsdom path, where computed durations are
        // 0): settle synchronously, exactly as before.
        if (!node || duration === 0) {
            complete(open, currentVersion);
            return;
        }

        // Prefer the Web Animations API so completion lands on the real
        // `animationend` / `transitionend` instead of a timer that can fire a frame
        // late — that lateness is what let a closing collapsible flash back to its
        // natural size before `hidden` was applied.
        const animations = typeof node.getAnimations === 'function' ? node.getAnimations() : [];

        // Safety net: if an animation never settles (interrupted, replaced without a
        // cancel event, reduced motion, or simply not exposed by the engine yet)
        // still complete shortly after the declared duration.
        timer = setTimeout(() => complete(open, currentVersion), duration + TRANSITION_FALLBACK_BUFFER);

        if (animations.length === 0) {
            return;
        }

        // A cancelled animation rejects `finished`; swallow it so reopening (which
        // cancels the in-flight animation) still resolves and settles.
        void Promise.all(animations.map((animation) => animation.finished.catch(() => undefined))).then(() =>
            complete(open, currentVersion)
        );
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
