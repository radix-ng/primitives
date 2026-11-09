// Passive DOM metadata shared by trigger-side and content-side guards. Layer relationships are
// still resolved by the floating tree; guards from an unrelated popup must remain outside.
const owners = new WeakMap<Element, () => Element | null | undefined>();

export function registerFocusGuardOwners(guards: Element[], owner: () => Element | null | undefined): () => void {
    guards.forEach((guard) => owners.set(guard, owner));
    return () => guards.forEach((guard) => owners.delete(guard));
}

export function resolveFocusGuardOwner(target: Node): Node {
    return owners.get(target as Element)?.() ?? target;
}
