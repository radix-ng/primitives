import { afterRenderEffect, type Signal, untracked } from '@angular/core';
import type { RdxNativeInputRef } from '@radix-ng/primitives/core';

/** Deliver the committed input once per binding and release the previous binding before attaching. */
export function useRadioInputRef(
    input: Signal<HTMLInputElement | null>,
    inputRef: Signal<RdxNativeInputRef | undefined>
): void {
    afterRenderEffect((onCleanup) => {
        const element = input();
        const ref = inputRef();
        if (!element || !ref) return;

        const release: unknown = untracked(() => ref(element));
        onCleanup(() =>
            untracked(() => {
                if (typeof release === 'function') (release as () => void)();
                else ref(null);
            })
        );
    });
}
