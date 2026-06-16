/** Selector for focusable menu items within a popup. */
export const RDX_MENU_ITEM_SELECTOR = [
    '[rdxMenuItem]:not([data-disabled])',
    '[rdxMenuCheckboxItem]:not([data-disabled])',
    '[rdxMenuRadioItem]:not([data-disabled])',
    '[rdxMenuLinkItem]:not([data-disabled])',
    '[rdxMenuSubTrigger]:not([data-disabled])'
].join(',');

export function getFocusableMenuItems(popup: HTMLElement): HTMLElement[] {
    return Array.from(popup.querySelectorAll<HTMLElement>(RDX_MENU_ITEM_SELECTOR)).filter(
        (item) => item.closest('[rdxMenuPopup]') === popup
    );
}
