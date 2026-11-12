import { dispatchClickWithModifiers } from '@radix-ng/primitives/core';

/** Native Enter stays with the browser; composite Space and custom hosts use one click path. */
export function handleMenuItemKeydown(
    event: KeyboardEvent,
    element: HTMLElement,
    disabled: boolean,
    typing: boolean
): void {
    if ((event.key !== 'Enter' && event.key !== ' ') || event.target !== element || event.defaultPrevented) return;
    if (event.key === ' ' && typing) return; // Popup owns the continuation of its existing search.
    if (disabled) {
        event.preventDefault();
        return;
    }
    event.stopPropagation();
    if (
        event.key === 'Enter' &&
        (element.tagName === 'BUTTON' || (element.tagName === 'A' && element.hasAttribute('href')))
    )
        return;
    event.preventDefault();
    dispatchClickWithModifiers(element, event);
}

export function handleMenuItemKeyup(event: KeyboardEvent, element: HTMLElement): void {
    // Space was already activated on keydown. Suppress a second native button click on keyup.
    if (event.key === ' ' && event.target === element && element.tagName === 'BUTTON') event.preventDefault();
}

/** Constructor-time default; a consumer's explicit native type keeps its meaning. */
export function setMenuItemButtonType(element: HTMLElement): void {
    if (element.tagName === 'BUTTON' && !element.hasAttribute('type')) element.setAttribute('type', 'button');
}
