import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    model,
    ModelSignal,
    output,
    untracked
} from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

export type RdxCollapsibleState = 'open' | 'closed';

export interface CollapsibleRootContext {
    contentId: InputSignal<string>;
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
    open: ModelSignal<boolean>;
    onOpenToggle: () => void;
}

export const [injectCollapsibleRootContext, provideCollapsibleRootContext] =
    createContext<CollapsibleRootContext>('CollapsibleRootContext');

const rootContext = (): CollapsibleRootContext => {
    const instance = inject(RdxCollapsibleRootDirective);

    return {
        contentId: instance.contentId,
        disabled: instance.disabled,
        open: instance.open,
        onOpenToggle: () => {
            untracked(() => instance.open.update((v) => !v));
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
        '[attr.data-state]': 'this.open() ? "open" : "closed"',
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

    /**
     * Emitted with new value when directive state changed.
     * Event handler called when the open state of the collapsible changes.
     *
     * @group Emits
     */
    readonly onOpenChange = output<boolean>();

    isOpen = computed(() => this.open());
}
