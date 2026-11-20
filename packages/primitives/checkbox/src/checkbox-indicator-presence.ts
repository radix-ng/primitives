import { computed, Directive, inject, input } from '@angular/core';
import { createContext, type RdxRenderLifecycle, useRenderLifecycle, watch } from '@radix-ng/primitives/core';
import { providePresenceTargetContext, usePresence } from '@radix-ng/primitives/presence';
import { type CheckboxRootContext, injectCheckboxRootContext } from './checkbox-root';

interface CheckboxIndicatorPresenceContext {
    readonly root: CheckboxRootContext;
    readonly transition: RdxRenderLifecycle;
}

export interface RdxCheckboxIndicatorPresenceOptions {
    keepMounted?: boolean;
}

/** @internal */
export const [injectCheckboxIndicatorPresence, provideCheckboxIndicatorPresence] =
    createContext<CheckboxIndicatorPresenceContext>('CheckboxIndicatorPresenceContext', 'components/checkbox');

/** Owns the indicator view until its exit motion completes. */
@Directive({
    selector: 'ng-template[rdxCheckboxIndicatorPresence]',
    providers: [
        provideCheckboxIndicatorPresence(() => inject(RdxCheckboxIndicatorPresenceDirective).context),
        providePresenceTargetContext(() => inject(RdxCheckboxIndicatorPresenceDirective).context.transition)
    ]
})
export class RdxCheckboxIndicatorPresenceDirective {
    /** Use `{ keepMounted: true }` to retain the unchecked view. */
    readonly rdxCheckboxIndicatorPresence = input<
        RdxCheckboxIndicatorPresenceOptions | undefined,
        RdxCheckboxIndicatorPresenceOptions | '' | undefined
    >(undefined, {
        transform: (options) => options || undefined
    });

    private readonly root = injectCheckboxRootContext();
    private readonly visible = computed(() => this.root.checked() || this.root.indeterminate());
    private readonly keepMounted = computed(() => this.rdxCheckboxIndicatorPresence()?.keepMounted ?? false);
    private readonly transition = useRenderLifecycle(undefined, {
        open: this.visible,
        debugName: 'RdxCheckboxIndicator'
    });

    /** @ignore */
    readonly context: CheckboxIndicatorPresenceContext = {
        root: this.root,
        transition: this.transition
    };

    constructor() {
        watch(
            [this.visible],
            ([visible]) => {
                if (visible && this.transition.status() === 'ending') this.transition.cancel();
                else this.transition.start(visible);
            },
            { defer: true }
        );
        usePresence({ present: this.visible, renderLifecycle: this.transition }, { keepMounted: this.keepMounted });
    }
}
