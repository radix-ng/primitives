import { booleanAttribute, computed, Directive, inject, input, Signal } from '@angular/core';
import { BooleanInput, createContext, createLabelRegistry, RdxLabelRegistry } from '@radix-ng/primitives/core';

const attr = (value: boolean) => (value ? '' : undefined);

export interface RdxFieldsetRootContext extends RdxLabelRegistry {
    readonly disabledState: Signal<boolean>;
}

const fieldsetRootContext = (): RdxFieldsetRootContext => {
    const root = inject(RdxFieldsetRoot);
    return {
        ...root.legendRegistry,
        disabledState: root.disabledState
    };
};

export const [injectFieldsetRootContext, provideFieldsetRootContext] = createContext<RdxFieldsetRootContext>(
    'RdxFieldsetRoot',
    'components/fieldset'
);

/**
 * Groups related form controls and disables them as a set.
 *
 * @group Components
 */
@Directive({
    selector: 'fieldset[rdxFieldsetRoot]',
    exportAs: 'rdxFieldsetRoot',
    providers: [provideFieldsetRootContext(fieldsetRootContext)],
    host: {
        '[attr.disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-disabled]': 'dataAttr(disabledState())'
    }
})
export class RdxFieldsetRoot {
    /**
     * Whether all controls in the fieldset are disabled.
     *
     * @group Props
     * @defaultValue false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    private readonly parentFieldset = inject(RdxFieldsetRoot, { skipSelf: true, optional: true });

    readonly disabledState: Signal<boolean> = computed(
        () => this.disabled() || (this.parentFieldset?.disabledState() ?? false)
    );

    /** @ignore Registered legend IDs for composite controls inside the fieldset. */
    readonly legendRegistry = createLabelRegistry();

    protected readonly dataAttr = attr;
}
