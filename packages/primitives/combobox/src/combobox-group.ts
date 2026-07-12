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

export const [injectComboboxGroupContext, provideComboboxGroupContext] = createContext<RdxComboboxGroupContext>(
    'RdxComboboxGroupContext',
    'components/combobox'
);

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

    // Group membership is unordered, so a stable Set avoids copying a growing array for every child
    // registration. The tick keeps the two derived host states reactive.
    private readonly items = new Set<ComboboxItemRef>();
    private readonly itemsTick = signal(0);

    protected readonly hasItems = computed(() => {
        this.itemsTick();
        return this.items.size > 0;
    });
    protected readonly hasVisibleItems = computed(() => {
        this.itemsTick();
        for (const item of this.items) {
            if (this.rootContext.isVisible(item)) {
                return true;
            }
        }
        return false;
    });

    registerItem(item: ComboboxItemRef): void {
        if (this.items.has(item)) {
            return;
        }
        this.items.add(item);
        this.itemsTick.update((tick) => tick + 1);
    }

    unregisterItem(item: ComboboxItemRef): void {
        if (this.items.delete(item)) {
            this.itemsTick.update((tick) => tick + 1);
        }
    }
}
