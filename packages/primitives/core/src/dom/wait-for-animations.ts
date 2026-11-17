/** Longest declared CSS transition/animation, including delays. */
export function getMaxTransitionDuration(element: HTMLElement): number {
    const styles = getComputedStyle(element);
    const duration = (durations = '', delays = '') => {
        const times = (value: string) =>
            value.split(',').map((time) => {
                const number = Number.parseFloat(time);
                return Number.isFinite(number) ? number * (time.trim().endsWith('ms') ? 1 : 1000) : 0;
            });
        const parsedDelays = times(delays);
        return times(durations).reduce(
            (max, time, index) => Math.max(max, time + parsedDelays[index % parsedDelays.length]),
            0
        );
    };
    return Math.max(
        duration(styles.transitionDuration, styles.transitionDelay),
        duration(styles.animationDuration, styles.animationDelay)
    );
}

/**
 * Waits for finite animations on explicit elements. Cancellation re-reads their animations so a
 * replacement transition owns completion. The AbortSignal cancels observation, never the animation.
 * Descendants and infinite animations do not participate implicitly.
 */
export function waitForAnimations(
    elements: readonly HTMLElement[],
    onComplete: () => void,
    signal: AbortSignal,
    onPending: (pending: boolean) => void = () => {}
): void {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let settled = false;
    const clearTimer = () => {
        if (timer !== undefined) clearTimeout(timer);
        timer = undefined;
    };
    const cleanup = () => {
        clearTimer();
        signal.removeEventListener('abort', abort);
    };
    const abort = () => {
        settled = true;
        cleanup();
        onPending(false);
    };
    const complete = () => {
        if (settled || signal.aborted) return;
        settled = true;
        cleanup();
        onPending(false);
        onComplete();
    };
    const scan = () => {
        if (settled || signal.aborted) return;
        clearTimer();
        const animations = new Set<Animation>();
        let remaining = 0;
        for (const element of elements) {
            if (typeof element.getAnimations !== 'function') {
                remaining = Math.max(remaining, getMaxTransitionDuration(element));
                continue;
            }
            for (const animation of element.getAnimations()) {
                const timing = animation.effect?.getTiming();
                if (timing?.iterations === Infinity || timing?.duration === Infinity) continue;
                animations.add(animation);
                // A paused animation is deliberately controlled by its owner; a wall-clock timer
                // cannot establish its completion. WAAPI timing includes delay, iterations and rate.
                if (animation.playState === 'paused' || animation.playbackRate === 0) {
                    remaining = Infinity;
                } else {
                    const end = animation.effect?.getComputedTiming().endTime;
                    const current = Number(animation.currentTime ?? 0);
                    const rate = animation.playbackRate ?? 1;
                    const time =
                        typeof end === 'number'
                            ? (rate < 0 ? current : end - current) / Math.abs(rate)
                            : getMaxTransitionDuration(element);
                    remaining = Math.max(remaining, time);
                }
            }
        }
        if (!animations.size && remaining === 0) {
            complete();
            return;
        }
        onPending(true);
        if (Number.isFinite(remaining))
            timer = setTimeout(
                () => {
                    // The owner may pause motion after discovery. Re-check at the safety boundary rather
                    // than treating a deliberately paused animation as an engine that failed to settle.
                    if (
                        [...animations].some(
                            (animation) => animation.playState === 'paused' || animation.playbackRate === 0
                        )
                    )
                        scan();
                    else complete();
                },
                Math.max(0, remaining) + 50
            );
        if (animations.size) {
            // Discard fulfilled Animation values so an unfinished peer does not retain their DOM.
            void Promise.all([...animations].map((animation) => animation.finished.then(() => undefined))).then(
                complete,
                scan
            );
        }
    };
    if (signal.aborted) return;
    signal.addEventListener('abort', abort, { once: true });
    scan();
}
