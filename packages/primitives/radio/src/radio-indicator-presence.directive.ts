import { computed, Directive, effect, inject, input, Signal, untracked } from '@angular/core';
import { createContext, RdxRenderLifecycle, useRenderLifecycle } from '@radix-ng/primitives/core';
import { providePresenceTargetContext, usePresence } from '@radix-ng/primitives/presence';
import { injectRadioItemContext, RadioItemContext } from './radio-item.directive';

interface RadioIndicatorPresenceContext {
    readonly item: RadioItemContext;
    readonly transition: RdxRenderLifecycle;
}

export interface RdxRadioIndicatorPresenceOptions {
    keepMounted?: boolean;
}

/** @internal */
export const [injectRadioIndicatorPresence, provideRadioIndicatorPresence] =
    createContext<RadioIndicatorPresenceContext>('RadioIndicatorPresenceContext', 'components/radio');

/** @internal Drive Indicator motion from accepted selection changes. */
export function useRadioIndicatorTransition(checked: Signal<boolean>): RdxRenderLifecycle {
    const transition = useRenderLifecycle(undefined, { open: checked, debugName: 'RdxRadioIndicator' });
    let previous: boolean | undefined;
    effect(() => {
        const selected = checked();
        if (previous !== undefined && previous !== selected) {
            untracked(() => {
                // Reselecting during exit reuses the mounted view and cancels its removal.
                if (selected && transition.mounted()) transition.cancel();
                else transition.start(selected);
            });
        }
        previous = selected;
    });
    return transition;
}

/** Owns the indicator host and its Angular children until its exit motion finishes. */
@Directive({
    selector: 'ng-template[rdxRadioIndicatorPresence]',
    providers: [
        provideRadioIndicatorPresence(() => inject(RdxRadioIndicatorPresenceDirective).context),
        providePresenceTargetContext(() => inject(RdxRadioIndicatorPresenceDirective).context.transition)
    ]
})
export class RdxRadioIndicatorPresenceDirective {
    /** Use `{ keepMounted: true }` to retain the unchecked view. */
    readonly rdxRadioIndicatorPresence = input<
        RdxRadioIndicatorPresenceOptions | undefined,
        RdxRadioIndicatorPresenceOptions | '' | undefined
    >(undefined, {
        transform: (options) => options || undefined
    });
    private readonly keepMounted = computed(() => this.rdxRadioIndicatorPresence()?.keepMounted ?? false);

    private readonly item = injectRadioItemContext();
    /** @ignore Only the Indicator using the same Radio Item consumes this lifetime. */
    readonly context: RadioIndicatorPresenceContext = {
        item: this.item,
        transition: useRadioIndicatorTransition(this.item.checkedState)
    };

    constructor() {
        usePresence(
            { present: this.item.checkedState, renderLifecycle: this.context.transition },
            { keepMounted: this.keepMounted }
        );
    }
}
