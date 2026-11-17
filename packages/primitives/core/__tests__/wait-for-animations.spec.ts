import { waitForAnimations } from '../src/dom/wait-for-animations';
import { animationDriver } from './animation-driver';

describe('animation completion fallback', () => {
    afterEach(() => vi.useRealTimers());

    for (const first of ['WAAPI', 'CSS fallback']) {
        it(`waits for both kinds of participant when ${first} completes first`, async () => {
            vi.useFakeTimers();
            const fallback = document.createElement('div');
            fallback.style.transitionDuration = '100ms';
            const animated = document.createElement('div');
            const motion = animationDriver();
            animated.getAnimations = () => [motion.animation];
            const complete = vi.fn();
            waitForAnimations([fallback, animated], complete, new AbortController().signal);
            if (first === 'WAAPI') await motion.finish();
            else await vi.advanceTimersByTimeAsync(200);
            expect(complete).not.toHaveBeenCalled();
            if (first === 'WAAPI') await vi.advanceTimersByTimeAsync(200);
            else await motion.finish();
            expect(complete).toHaveBeenCalledOnce();
        });
    }

    it('cancels a CSS fallback timer when observation is aborted', async () => {
        vi.useFakeTimers();
        const fallback = document.createElement('div');
        fallback.style.transitionDuration = '100ms';
        const controller = new AbortController();
        const complete = vi.fn();
        waitForAnimations([fallback], complete, controller.signal);
        controller.abort();
        await vi.advanceTimersByTimeAsync(200);
        expect(complete).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });
});
