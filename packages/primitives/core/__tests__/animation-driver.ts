/** A manually controlled WAAPI protocol double. CSS discovery itself is covered in Playwright. */
export function animationDriver(iterations = 1) {
    let resolve!: () => void;
    let reject!: (reason: unknown) => void;
    const finished = new Promise<void>((done, cancel) => {
        resolve = done;
        reject = cancel;
    });
    const animation = {
        finished,
        currentTime: 0,
        playbackRate: 1,
        playState: 'running',
        effect: {
            getTiming: () => ({ duration: 10_000, iterations }),
            getComputedTiming: () => ({ endTime: iterations * 10_000 })
        }
    } as unknown as Animation;
    return {
        animation,
        finish: async () => {
            resolve();
            await Promise.resolve();
            await Promise.resolve();
        },
        cancel: async () => {
            reject(new DOMException('Canceled', 'AbortError'));
            await Promise.resolve();
            await Promise.resolve();
        }
    };
}
