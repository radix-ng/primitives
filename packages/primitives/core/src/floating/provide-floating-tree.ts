import { inject, InjectionToken, Provider } from '@angular/core';
import { RdxFloatingNode, RdxFloatingParentOverride, RdxFloatingTree } from './floating-tree';

/**
 * The nearest shared {@link RdxFloatingTree}. **Scoped-by-default, sharing explicit** — strict Base UI
 * parity: Base UI creates a `FloatingTree` only where nested floating elements must coordinate. There is
 * deliberately **no** application-root provider, so the token resolves only under a root that opts in
 * with {@link provideFloatingTree}; elsewhere injecting it optionally yields `null` and the primitive is
 * its own independent root (`parent === null`). This keeps each tree's `events` channel private to its
 * coordinating subtree (no app-wide leak) without forcing node identity onto every event.
 *
 * A nesting-capable root (Menu/Menubar/nested Dialog) provides one tree for its descendants; a
 * standalone popup needs no shared tree at all.
 */
export const RDX_FLOATING_TREE = new InjectionToken<RdxFloatingTree>('RdxFloatingTree');

/**
 * Provides a {@link RdxFloatingTree} for a subtree — the Angular `FloatingTree` analogue. A
 * nesting-capable root puts this in its `providers` so descendants join the same tree.
 */
export function provideFloatingTree(): Provider {
    return { provide: RDX_FLOATING_TREE, useFactory: () => new RdxFloatingTree() };
}

/**
 * The nearest enclosing {@link RdxFloatingNode}, used to resolve a child's **logical** parent
 * (`inherit`). A floating directive provides itself under this token so descendants reparent to it
 * regardless of where the portal relocates them in the DOM — the Angular analogue of Base UI's
 * `FloatingNodeContext` (`parentId`).
 *
 * This is **tree selection / parent assignment only**: a detached *trigger* is never provided here
 * (it has no node, ADR 0015 §1/§2).
 */
export const RDX_FLOATING_NODE = new InjectionToken<RdxFloatingNode>('RdxFloatingNode');

/**
 * Resolves a {@link RdxFloatingParentOverride} to a concrete parent node, in an injection context:
 *
 * - `inherit` (default) → the nearest enclosing {@link RDX_FLOATING_NODE} (DI ancestry), or `null`;
 * - `root` → `null` (independent root — DI ancestry ignored);
 * - `node` → the explicitly supplied parent (detached injector-subtree composition).
 *
 * Keeping `inherit` and `root` distinct is the whole point of the discriminated override: "no
 * override" and "explicit independent root" must not both collapse to `parent == null` by accident.
 */
export function resolveFloatingParent(
    override: RdxFloatingParentOverride = { kind: 'inherit' }
): RdxFloatingNode | null {
    switch (override.kind) {
        case 'root':
            return null;
        case 'node':
            return override.parent;
        case 'inherit':
        default:
            return inject(RDX_FLOATING_NODE, { optional: true, skipSelf: true });
    }
}
