import { getActiveElement, isHTMLElement, isShadowRoot } from '@radix-ng/primitives/core';
import type { RdxPortalTarget } from './resolve-container';

/** Move the existing Angular view while preserving focus that belongs to it. */
export function movePortalNodes(nodes: readonly Node[], target: RdxPortalTarget): void {
    const sourceRoot = nodes[0]?.getRootNode();
    const active =
        sourceRoot && (sourceRoot.nodeType === 9 || isShadowRoot(sourceRoot))
            ? getActiveElement(sourceRoot as Document | ShadowRoot)
            : null;
    let ancestor: Node | null = active;
    while (ancestor && !nodes.includes(ancestor))
        ancestor = isShadowRoot(ancestor) ? ancestor.host : ancestor.parentNode;
    const focused = ancestor && isHTMLElement(active) ? active : null;

    for (const node of nodes) {
        if (node.parentNode !== target) target.appendChild(node);
    }
    // appendChild can clear focus in an already active view. Restore only the
    // moved view's own focus, after every root is connected; unrelated focus stays authoritative.
    if (focused?.isConnected && getActiveElement(focused.ownerDocument) !== focused)
        focused.focus({ preventScroll: true });
}
