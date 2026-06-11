import { computed, Directive, inject, signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
import { ComboboxItemRef, injectComboboxRootContext } from './combobox-root';

const groupContext = () => {
    const group = inject(RdxComboboxGroup);
    return {
        labelId: group.labelId,
        registerItem: (item: ComboboxItemRef) => group.registerItem(item),
        unregisterItem: (item: ComboboxItemRef) => group.unregisterItem(item)
    };
};

export type RdxComboboxGroupContext = ReturnType<typeof groupContext>;

export const [injectComboboxGroupContext, provideComboboxGroupContext] =
    createContext<RdxComboboxGroupContext>('RdxComboboxGroupContext');

/**
 * Groups related options under a shared label. Hides itself when all of its items are filtered out,
 * so a group heading never lingers above an empty section.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxGroup]',
    exportAs: 'rdxComboboxGroup',
    providers: [provideComboboxGroupContext(groupContext)],
    host: {
        role: 'group',
        '[attr.aria-labelledby]': 'labelId()',
        '[hidden]': 'hasItems() && !hasVisibleItems()'
    }
})
export class RdxComboboxGroup {
    private readonly rootContext = injectComboboxRootContext();

    readonly labelId = signal<string | undefined>(undefined);

    private readonly items = signal<readonly ComboboxItemRef[]>([]);

    protected readonly hasItems = computed(() => this.items().length > 0);
    protected readonly hasVisibleItems = computed(() => this.items().some((item) => this.rootContext.isVisible(item)));

    registerItem(item: ComboboxItemRef): void {
        this.items.update((items) => [...items, item]);
    }

    unregisterItem(item: ComboboxItemRef): void {
        this.items.update((items) => items.filter((i) => i !== item));
    }
}
