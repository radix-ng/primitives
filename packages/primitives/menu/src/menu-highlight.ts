import { afterRenderEffect, Signal, untracked, WritableSignal } from '@angular/core';
import type { RdxCompositeListContext } from '@radix-ng/primitives/composite';
import { getFocusableMenuItems } from './menu-focus';

type HighlightInput =
    | { reason: 'keyboard'; event: KeyboardEvent }
    | { reason: 'pointer'; event: MouseEvent | PointerEvent }
    | { reason: 'none'; event: Event };

export type RdxMenuHighlightReason = HighlightInput['reason'];

/** The highlighted native item and the input which caused its change. */
export type RdxMenuItemHighlightedEvent = HighlightInput & {
    item: HTMLElement | undefined;
    label: string | undefined;
};

function highlightInput(event?: Event): HighlightInput {
    if (event instanceof KeyboardEvent) return { reason: 'keyboard', event };
    if (event instanceof MouseEvent) return { reason: 'pointer', event };
    return { reason: 'none', event: event ?? new Event('menu.item-highlighted') };
}

/** @internal Observe Angular's settled collection, including replacement at an unchanged index. */
export function useMenuHighlight(config: {
    open: Signal<boolean>;
    activeIndex: WritableSignal<number | null>;
    list: Signal<RdxCompositeListContext | null>;
    popup: Signal<HTMLElement | undefined>;
    emit: (details: RdxMenuItemHighlightedEvent) => void;
}): (index: number | null, sourceEvent?: Event) => void {
    let reportedItem: HTMLElement | undefined;
    let reportedIndex = -1;
    let event: Event | undefined;

    function itemAt(index: number | null): HTMLElement | undefined {
        const list = config.list();
        const popup = config.popup();
        return index === null
            ? undefined
            : (list?.items()[index]?.element ?? (popup ? getFocusableMenuItems(popup)[index] : undefined));
    }

    afterRenderEffect({
        read: () => {
            const open = config.open();
            const index = config.activeIndex();
            const list = config.list();
            const map = list?.itemMap();
            const popup = config.popup();
            const rendered = !open || index === null || !popup ? undefined : getFocusableMenuItems(popup)[index];
            // New composite items register after their first render. Do not report the surviving
            // neighbour at this index while Angular is still registering the replacement.
            if (rendered && map?.size && !map.has(rendered)) return;
            const item = open ? itemAt(index) : undefined;
            if (item?.isConnected === false) return;
            const itemIndex = item === undefined ? -1 : index;
            if (reportedIndex === itemIndex && reportedItem === item) return;

            reportedIndex = itemIndex ?? -1;
            reportedItem = item;
            const details: RdxMenuItemHighlightedEvent = {
                item,
                label: item
                    ? ((map?.get(item)?.['label'] as string | undefined) ??
                      item.dataset['label'] ??
                      item.textContent?.trim())
                    : undefined,
                ...highlightInput(event)
            };
            event = undefined;
            untracked(() => config.emit(details));
        }
    });

    return (index: number | null, sourceEvent?: Event) =>
        untracked(() => {
            if (config.activeIndex() === index) return;
            // A write back before rendering does not attribute a later collection change to old input.
            const writeBack = itemAt(index) === reportedItem;
            event = writeBack ? undefined : sourceEvent;
            config.activeIndex.set(index);
        });
}
