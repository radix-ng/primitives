import { focusable } from '@radix-ng/primitives/focus-scope';
import type { RdxNavigationMenuRootContext } from './navigation-menu-root-context';
import { focusFirst, getTabbableCandidates } from './utils';

const VIEWPORT = '[rdxNavigationMenuViewport]';
const PART = '[rdxNavigationMenuTrigger], [rdxNavigationMenuLink]';

/** Each viewport owns its content's arrows; the portaled ancestor owns logical Tab departure. */
export function handleNavigationMenuKeydown(
    event: KeyboardEvent,
    container: HTMLElement,
    root: RdxNavigationMenuRootContext
): void {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    if (event.key === 'Tab') {
        // Inline children have no portal to leave. Let the enclosing viewport handle its boundary.
        if (!root.popup()) return;
        const items = getTabbableCandidates(container);
        const index = items.indexOf(container.ownerDocument.activeElement as HTMLElement);
        if (event.shiftKey && index <= 0) {
            event.preventDefault();
            event.stopPropagation();
            root.trigger()?.focus();
        } else if (!event.shiftKey && index === items.length - 1) {
            const list = root.list();
            const triggers = list
                ? Array.from(list.querySelectorAll<HTMLElement>(PART)).filter(
                      (item) => !item.hasAttribute('disabled') && item.getAttribute('aria-hidden') !== 'true'
                  )
                : root.triggers();
            const current = triggers.indexOf(root.trigger()!);
            const next = current === -1 ? undefined : triggers[current + 1];
            if (next) {
                event.preventDefault();
                event.stopPropagation();
                next.focus();
            }
        }
        return;
    }
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    if (container.matches(VIEWPORT) && target.closest(VIEWPORT) !== container) return;

    // Arrow navigation includes composite parts with tabindex=-1, while Tab retains native order.
    // Nested inline viewports own their links; their triggers remain in this parent collection.
    const items = focusable(container).filter(
        (item): item is HTMLElement =>
            item.namespaceURI === 'http://www.w3.org/1999/xhtml' &&
            (item.tabIndex >= 0 || item.matches(PART)) &&
            (!container.matches(VIEWPORT) || item.closest(VIEWPORT) === container)
    );
    if (!items.length) return;
    const index = items.indexOf(container.ownerDocument.activeElement as HTMLElement);
    let next: HTMLElement | undefined;
    if (event.key === 'Home') next = items[0];
    else if (event.key === 'End') next = items.at(-1);
    else if (event.key === 'ArrowUp') next = index <= 0 ? root.trigger() : items[index - 1];
    else {
        const forward =
            event.key === 'ArrowDown' ||
            (root.dir() === 'rtl' ? event.key === 'ArrowLeft' : event.key === 'ArrowRight');
        next =
            index < 0
                ? forward
                    ? items[0]
                    : items.at(-1)
                : items[(index + (forward ? 1 : -1) + items.length) % items.length];
    }
    if (!next || next === container.ownerDocument.activeElement) return;
    event.preventDefault();
    event.stopPropagation();
    focusFirst([next]);
}
