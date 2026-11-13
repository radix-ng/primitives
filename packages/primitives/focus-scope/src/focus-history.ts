import { isFocusableElement } from './tabbable';

/** Surviving return targets when a popup replaces the previously focused popup in the same gesture. */
const history = new WeakMap<Document, WeakRef<HTMLElement>[]>();

export function rememberFocusedElement(document: Document, element: HTMLElement | null): void {
    if (!element || element === document.body) return;
    const entries = (history.get(document) ?? []).filter((entry) => entry.deref()?.isConnected);
    entries.push(new WeakRef(element));
    history.set(document, entries.slice(-20));
}

export function getPreviouslyFocusedElement(document: Document): HTMLElement | undefined {
    const entries = (history.get(document) ?? []).filter((entry) => entry.deref()?.isConnected);
    history.set(document, entries);
    for (let index = entries.length - 1; index >= 0; index--) {
        const element = entries[index].deref();
        if (isFocusableElement(element)) return element;
    }
    return undefined;
}
