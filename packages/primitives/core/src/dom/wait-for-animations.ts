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
        let fallbackDuration = 0;
        for (const element of elements) {
            if (typeof element.getAnimations !== 'function') {
                fallbackDuration = Math.max(fallbackDuration, getMaxTransitionDuration(element));
                continue;
            }
            for (const animation of element.getAnimations()) {
                const timing = animation.effect?.getTiming();
                if (timing?.iterations === Infinity || timing?.duration === Infinity) continue;
                animations.add(animation);
            }
        }
        if (!animations.size && fallbackDuration === 0) {
            complete();
            return;
        }
        onPending(true);
        // The finished promise follows timing/rate changes and deliberate pauses. A snapshot of
        // endTime cannot bound those animations. Only elements without WAAPI need a CSS timer.
        // Discard fulfilled Animation values so an unfinished peer does not retain their DOM.
        const completions: Promise<void>[] = [...animations].map((animation) =>
            animation.finished.then(() => undefined)
        );
        if (fallbackDuration > 0)
            completions.push(
                new Promise<void>((resolve) => {
                    timer = setTimeout(resolve, fallbackDuration + 50);
                })
            );
        void Promise.all(completions).then(complete, scan);
    };
    if (signal.aborted) return;
    signal.addEventListener('abort', abort, { once: true });
    scan();
}
