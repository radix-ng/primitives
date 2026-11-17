/** DOM document-order helpers; numeric position flags also work in SSR without a global Node. */
export function compareNodeDocumentPosition(a: Node, b: Node): number {
    const position = a.compareDocumentPosition(b);

    // Disconnected nodes have no document order; preserve their registration order.
    if (position & 1) return 0;

    if (position & 4 || position & 16) {
        return -1;
    }

    if (position & 2 || position & 8) {
        return 1;
    }

    return 0;
}

export function sortByDocumentPosition<T extends { element: HTMLElement }>(items: readonly T[]): T[] {
    return [...items]
        .filter((item) => item.element.isConnected)
        .sort((a, b) => compareNodeDocumentPosition(a.element, b.element));
}

/**
 * Smallest set of container elements whose child order can change the relative
 * order of the given (already document-sorted) nodes. Observing each adjacent
 * pair's common ancestor catches both direct item moves and wrapper moves at the
 * boundary, mirroring Base UI's composite list observer.
 */
export function getAdjacentNodeRoots(nodes: readonly Element[]): Set<Element> {
    const roots = new Set<Element>();

    for (let index = 1; index < nodes.length; index += 1) {
        const ancestor = getCommonAncestor(nodes[index - 1], nodes[index]);

        if (ancestor) {
            roots.add(ancestor);
        }
    }

    return roots;
}

function getCommonAncestor(firstNode: Element, lastNode: Element): Element | null {
    let ancestor = firstNode.parentElement;

    // `parentElement` cannot cross shadow boundaries, so native `contains` suffices.
    while (ancestor && !ancestor.contains(lastNode)) {
        ancestor = ancestor.parentElement;
    }

    return ancestor;
}

/**
 * Whether a batch of mutations moved a node (removed then re-added in the same
 * batch, or reparented so a removed node is still connected) rather than a pure
 * add/remove. Pure adds/removals re-sort through register/unregister and cannot
 * change the relative order of the remaining items.
 */
export function hasMovedNode(entries: readonly MutationRecord[]): boolean {
    const removed = new Set<Node>();

    // Records are chronological: an addition following a removal is a move, while
    // a removal following an addition is a net removal.
    for (const entry of entries) {
        for (let i = 0; i < entry.addedNodes.length; i += 1) {
            if (removed.has(entry.addedNodes[i])) {
                return true;
            }
        }

        for (let i = 0; i < entry.removedNodes.length; i += 1) {
            removed.add(entry.removedNodes[i]);
        }
    }

    // A removed node that is still connected was reparented into a container this
    // observer does not watch.
    for (const node of removed) {
        if (node.isConnected) {
            return true;
        }
    }

    return false;
}
