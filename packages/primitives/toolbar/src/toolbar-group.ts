import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectToolbarRootContext, provideToolbarGroupContext, RdxToolbarGroupContext } from './toolbar-context';

const groupContext = (): RdxToolbarGroupContext => {
    const group = inject(RdxToolbarGroup);
    return { disabled: group.isDisabled };
};

/**
 * Groups several toolbar items together. Disabling the group disables all of its items.
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: '[rdxToolbarGroup]',
    exportAs: 'rdxToolbarGroup',
    providers: [provideToolbarGroupContext(groupContext)],
    host: {
        role: 'group',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined'
    }
})
export class RdxToolbarGroup {
    protected readonly rootContext = injectToolbarRootContext()!;

    /**
     * Whether the group is disabled.
     *
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @ignore Effective disabled state, combining the group and the toolbar. */
    readonly isDisabled = computed(() => this.disabled() || this.rootContext.disabled());
}
