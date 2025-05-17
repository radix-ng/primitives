import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    InputSignal,
    linkedSignal,
    model,
    ModelSignal,
    output,
    Signal,
    untracked
} from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

export type RdxCollapsibleState = 'open' | 'closed';

export interface CollapsibleRootContext {
    contentId: InputSignal<string>;
    open: ModelSignal<boolean>;
    toggle: () => void;
    disabled: Signal<boolean>;
}

export const [injectCollapsibleRootContext, provideCollapsibleRootContext] =
    createContext<CollapsibleRootContext>('CollapsibleRootContext');

const rootContext = (): CollapsibleRootContext => {
    const instance = inject(RdxCollapsibleRootDirective);

    return {
        contentId: instance.contentId,
        disabled: instance.isDisabled,
        open: instance.open,
        toggle: () => {
            untracked(() => {
                instance.open.set(!instance.open());
            });
            instance.onOpenChange.emit(instance.open());
        }
    };
};

/**
 * @group Components
 */
@Directive({
    selector: '[rdxCollapsibleRoot]',
    exportAs: 'rdxCollapsibleRoot',
    providers: [provideCollapsibleRootContext(rootContext)],
    host: {
        '[attr.data-state]': 'open() ? "open" : "closed"',
        '[attr.data-disabled]': 'disabled() ? "" : undefined'
    }
})
export class RdxCollapsibleRootDirective {
    /**
     * The controlled open state of the collapsible.
     * Sets the state of the directive. `true` - expanded, `false` - collapsed
     *
     * @group Props
     * @defaultValue false
     */
    readonly open = model<boolean>(false);

    readonly contentId = input<string>('');

    /**
     * Determines whether a directive is available for interaction.
     * When true, prevents the user from interacting with the collapsible.
     *
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly _disabled = linkedSignal(this.disabled);

    readonly isDisabled = this._disabled.asReadonly();

    readonly isOpen = computed(() => this.open());

    /**
     * Emitted with new value when directive state changed.
     * Event handler called when the open state of the collapsible changes.
     *
     * @group Emits
     */
    readonly onOpenChange = output<boolean>();
}
