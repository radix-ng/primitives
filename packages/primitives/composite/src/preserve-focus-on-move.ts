import { getActiveElement, isHTMLElement } from '@radix-ng/primitives/core';

/** Preserve the focused native node across Angular view moves, never across view destruction. */
export function preserveFocusOnMove(
    root: HTMLElement,
    owns: (element: HTMLElement) => boolean,
    restore: (element: HTMLElement) => void
): () => void {
    if (typeof MutationObserver !== 'function') return () => {};

    let focused: HTMLElement | null = null;
    const observer = new MutationObserver(restoreMovedFocus);

    function restoreMovedFocus(records: MutationRecord[]): boolean {
        const element = focused;
        if (!element?.isConnected || !root.contains(element) || !owns(element)) return false;
        const active = getActiveElement(element.ownerDocument);
        if (active && active !== element.ownerDocument.body) return false;
        const moved = records.some((record) =>
            Array.from(record.removedNodes).some((node) => node.isConnected && node.contains(element))
        );
        if (!moved) return false;
        restore(element);
        return getActiveElement(element.ownerDocument) === element;
    }

    function onFocusIn(event: FocusEvent): void {
        observer.disconnect();
        focused = isHTMLElement(event.target) && owns(event.target) ? event.target : null;
        if (focused) observer.observe(root, { childList: true, subtree: true });
    }

    function onFocusOut(event: FocusEvent): void {
        if (event.relatedTarget != null) {
            focused = null;
            observer.disconnect();
            return;
        }
        const lost = focused;
        // Native blur precedes the removal mutation. Inspect that render's records after the
        // synchronous DOM update, then release ownership for an ordinary deliberate blur.
        queueMicrotask(() => {
            if (focused !== lost) return;
            if (restoreMovedFocus(observer.takeRecords())) return;
            if (focused === lost) {
                focused = null;
                observer.disconnect();
            }
        });
    }

    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    return () => {
        focused = null;
        observer.disconnect();
        root.removeEventListener('focusin', onFocusIn);
        root.removeEventListener('focusout', onFocusOut);
    };
}
