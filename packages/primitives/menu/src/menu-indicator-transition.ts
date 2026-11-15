import { computed, DestroyRef, effect, ElementRef, inject, Signal, untracked } from '@angular/core';
import { useTransitionStatus } from '@radix-ng/primitives/core';

/** Keep a consumer-owned indicator visible until its actual CSS exit finishes. */
export function useMenuIndicatorTransition(visible: Signal<boolean>) {
    const transition = useTransitionStatus(() => {});
    const unregister = transition.registerElement(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
    inject(DestroyRef).onDestroy(unregister);
    let previous: boolean | undefined;

    effect(() => {
        const next = visible();
        // Inputs (including a required RadioItem.value) are bound before the first effect.
        // Like the pin, an initially selected indicator does not play an enter transition.
        if (previous !== undefined && previous !== next) untracked(() => transition.start(next));
        previous = next;
    });

    return {
        status: transition.status,
        present: computed(() => visible() || transition.status() === 'ending')
    };
}
