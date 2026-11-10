import { getActiveElement, rdxPlatform } from '@radix-ng/primitives/core';
import type { FocusableElement } from './tabbable';
import { composedContains, focus } from './utils';

/** Repair focus lost to body during DOM updates, with the owning primitive's target policy. */
export function observeFocusRecovery(options: {
    container: HTMLElement;
    enabled: () => boolean;
    target: (previous: HTMLElement, moved: boolean, visible: boolean) => FocusableElement | undefined;
    restore?: (target: FocusableElement) => void;
}): () => void {
    const { container, enabled } = options;
    const doc = container.ownerDocument,
        view = doc.defaultView;
    if (!view || typeof view.MutationObserver !== 'function') return () => undefined;
    let previous: HTMLElement | undefined,
        moved = false,
        frame: number | undefined;
    const visible = (element: HTMLElement) =>
        element.isConnected &&
        (rdxPlatform.env.jsdom
            ? !element.closest('[hidden]') &&
              view.getComputedStyle(element).display !== 'none' &&
              view.getComputedStyle(element).visibility !== 'hidden'
            : element.getClientRects().length > 0 && view.getComputedStyle(element).visibility !== 'hidden');
    const schedule = () => {
        if (!enabled() || frame !== undefined) return;
        frame = view.requestAnimationFrame(() => {
            frame = undefined;
            const last = previous,
                changed = moved;
            moved = false;
            if (!enabled() || !last || getActiveElement(doc) !== doc.body) return;
            const target = options.target(last, changed, visible(last));
            if (target) (options.restore ?? focus)(target);
        });
    };
    const onFocusIn = (event: FocusEvent) => {
        const target = (event.composedPath()[0] ?? event.target) as HTMLElement | null;
        if (target && composedContains(container, target)) previous = target;
    };
    const onFocusOut = (event: FocusEvent) => {
        const target = (event.composedPath()[0] ?? event.target) as HTMLElement | null;
        if (target && composedContains(container, target)) {
            previous = target;
            schedule();
        }
    };
    const observer = new view.MutationObserver((records) => {
        const focused = previous;
        if (!focused || !enabled()) return;
        if (records.some((record) => [...record.removedNodes].some((node) => composedContains(node, focused))))
            moved = true;
        if (moved || !visible(focused)) schedule();
    });
    observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['hidden', 'class', 'style']
    });
    doc.addEventListener('focusin', onFocusIn, true);
    doc.addEventListener('focusout', onFocusOut, true);
    return () => {
        observer.disconnect();
        if (frame !== undefined) view.cancelAnimationFrame(frame);
        doc.removeEventListener('focusin', onFocusIn, true);
        doc.removeEventListener('focusout', onFocusOut, true);
    };
}
