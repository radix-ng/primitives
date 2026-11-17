import { afterNextRender, computed, effect, inject, Injector, Signal, signal, untracked } from '@angular/core';
import { RdxTransitionStatusRef, useTransitionStatus } from '@radix-ng/primitives/core';

/** Keep an outgoing Panel inert but visible through its first rendered exit frame, as Base UI does. */
export function useTabsPanelTransition(active: () => boolean): {
    transition: RdxTransitionStatusRef;
    exitFramePending: Signal<boolean>;
} {
    const injector = inject(Injector);
    const base = useTransitionStatus(() => {});
    const exitFramePending = signal(false);
    let previousActive = false;
    let first = true;

    effect((onCleanup) => {
        const nextActive = active();
        if (first) {
            first = false;
            previousActive = nextActive;
            return;
        }
        if (nextActive === previousActive) return;
        previousActive = nextActive;
        untracked(() => {
            exitFramePending.set(!nextActive);
            base.start(nextActive);
        });
        if (!nextActive) {
            let frame: number | undefined;
            const render = afterNextRender(
                () => {
                    frame = requestAnimationFrame(() => {
                        frame = undefined;
                        exitFramePending.set(false);
                    });
                },
                { injector }
            );
            onCleanup(() => {
                render.destroy();
                if (frame !== undefined) cancelAnimationFrame(frame);
            });
        }
    });

    return {
        transition: {
            ...base,
            get isExitPending() {
                return base.isExitPending;
            },
            status: computed(() => (exitFramePending() && !active() ? 'ending' : base.status()))
        },
        exitFramePending: exitFramePending.asReadonly()
    };
}
