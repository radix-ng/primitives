import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

const attr = (value: boolean) => (value ? '' : undefined);

const fieldsetRootContext = () => {
    const root = injectFieldsetRoot();

    return {
        disabledState: root.disabledState
    };
};

export type RdxFieldsetRootContext = ReturnType<typeof fieldsetRootContext>;

export const [injectFieldsetRootContext, provideFieldsetRootContext] =
    createContext<RdxFieldsetRootContext>('RdxFieldsetRoot');

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

    readonly disabledState = computed(() => this.disabled());

    protected readonly dataAttr = attr;
}

function injectFieldsetRoot(): RdxFieldsetRoot {
    return inject(RdxFieldsetRoot);
}
