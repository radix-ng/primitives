/** `Node.ELEMENT_NODE` / `Node.DOCUMENT_FRAGMENT_NODE`, spelled out so no global `Node` is needed. */
const ELEMENT_NODE = 1;
const DOCUMENT_FRAGMENT_NODE = 11;

/** Attribute every menu positioner carries, naming the menu chain it belongs to. */
export const MENU_OWNER_ATTR = 'data-rdx-menu-owner';

/** Whether `node` is a shadow root (its host continues the walk upward). */
function isShadowRoot(value: Node | null): value is ShadowRoot {
    return value !== null && value.nodeType === DOCUMENT_FRAGMENT_NODE && 'host' in value;
}

/**
 * Walks up from `node` — through shadow boundaries — to the id of the menu chain that owns it, or
 * `undefined` when the node sits outside every menu.
 *
 * DOM containment is not enough on its own: a submenu is portaled next to the root's popup rather than
 * inside it, so it is a DOM sibling of the menu it belongs to (Base UI `findRootOwnerId`).
 */
export function findMenuOwnerId(node: Node | null): string | undefined {
    let current: Node | null = node;

    while (current) {
        // `nodeType` rather than `instanceof Element`: a node from another window (an iframe, a
        // different realm) fails the constructor check and would look like it belongs to no menu.
        // The literal keeps this off the global `Node` too, so it is safe to import on the server.
        if (current.nodeType === ELEMENT_NODE) {
            const element = current as Element;
            if (element.hasAttribute(MENU_OWNER_ATTR)) {
                return element.getAttribute(MENU_OWNER_ATTR) ?? undefined;
            }
        }

        const parent: Node | null = current.parentNode;
        if (parent) {
            current = parent;
            continue;
        }

        const root = current.getRootNode();
        current = isShadowRoot(root) ? root.host : null;
    }

    return undefined;
}
