import { RdxFloatingRootContext } from './floating-root-context';
import { RdxFloatingTree } from './floating-tree';
import { inject, InjectionToken, Provider } from '@angular/core';

/**
 * The nearest shared {@link RdxFloatingTree}. **Scoped-by-default, sharing explicit** — strict Base UI
 * parity: Base UI creates a `FloatingTree` only at the **coordination boundary** (e.g. a top-level Menu
 * renders `<FloatingTree>`, a nested submenu does **not** — it inherits the parent's store,
 * `MenuRoot.tsx:533`). There is deliberately **no** application-root provider, so the token resolves only
 * under a root that opts in with {@link provideFloatingTree}; elsewhere injecting it optionally yields
 * `null` and the primitive is its own independent root (`parent === null`).
 */
export const RDX_FLOATING_TREE = new InjectionToken<RdxFloatingTree>('RdxFloatingTree');

/**
 * Provides a {@link RdxFloatingTree} for a subtree — the Angular `FloatingTree` analogue. **Inherit-or-
 * create:** it returns the **nearest ancestor tree** if one is already provided above, and creates a new
 * one **only at the top coordination boundary**. This is what makes it safe for a nesting-capable root
 * (Menu/Menubar/Context Menu/nested Dialog) to put it in `providers` unconditionally — a **nested**
 * instance inherits the parent's tree (so its node parents correctly), while the **top** instance starts
 * the store. (An always-new tree on a nested root would split ancestry / throw `cross-tree-parent`.)
 *
 * **Tree selection is separate from parent assignment** (Base UI: `tree = externalTree ?? contextTree`,
 * `parentId = nearest FloatingNodeContext`). This helper + {@link resolveFloatingTree} own tree
 * selection. Parent assignment is resolved at runtime via the `RdxFloatingRegistrationContext` handle
 * (`parentReg.node()` in `effect()`). In particular `{ kind: 'root' }` is **not** tree isolation — it
 * sets `parent = null` **within the same tree**. A genuinely separate tree is supplied explicitly via
 * `resolveFloatingTree(externalTree)`.
 */
export function provideFloatingTree(): Provider {
    return {
        provide: RDX_FLOATING_TREE,
        useFactory: () => inject(RDX_FLOATING_TREE, { optional: true, skipSelf: true }) ?? new RdxFloatingTree()
    };
}

/**
 * Resolves **which tree** a node joins — the tree-selection contract, the Angular counterpart of Base
 * UI's `externalTree ?? contextTree` (`FloatingTree.tsx:25`). An explicit `externalTree` wins,
 * otherwise the nearest injected {@link RDX_FLOATING_TREE} (or `null` → the capability runs
 * **node-optional**). Parent assignment is separate — resolved reactively via
 * `parentReg.node()` from the {@link RDX_FLOATING_REGISTRATION} handle, not via a token.
 *
 * For a **detached** node registered with an explicit `{ kind: 'node', parent }` override from a sibling
 * injector, the nearest injected tree may be absent or a *different* tree than `parent.tree` — so the
 * caller **must** pass `externalTree = override.parent.tree` here, so the node joins its parent's tree (the
 * cross-tree invariant then holds). Must be called in an injection context when `externalTree` is omitted.
 */
export function resolveFloatingTree(externalTree?: RdxFloatingTree | null): RdxFloatingTree | null {
    return externalTree ?? inject(RDX_FLOATING_TREE, { optional: true });
}

/**
 * The shared per-popup {@link RdxFloatingRootContext} — the Angular counterpart of Base UI's
 * `FloatingRootContext`, created by `useFloatingRootContext` at the **primitive root** and **received**
 * by `useDismiss` / `FloatingFocusManager` (they never create their own). Mirroring that: a primitive
 * root (Dialog/Popover/Menu/…) creates **one** context and provides it here; the dismissal capability
 * (ADR 0015) and the focus manager (ADR 0017) read the **same** context, so `open`, `triggers`, and the
 * elements are never split across mechanisms.
 *
 * Optional: a **standalone** `rdxDismissableLayer` (no enclosing primitive root) has none, and
 * {@link injectFloatingRootContext} creates a fallback for that case only.
 */
export const RDX_FLOATING_ROOT_CONTEXT = new InjectionToken<RdxFloatingRootContext>('RdxFloatingRootContext');

/** Provides the shared {@link RdxFloatingRootContext} for a primitive root's subtree. */
export function provideFloatingRootContext(factory: () => RdxFloatingRootContext): Provider {
    return { provide: RDX_FLOATING_ROOT_CONTEXT, useFactory: factory };
}

/**
 * Returns the shared {@link RdxFloatingRootContext} provided by an enclosing primitive root, or creates
 * a **standalone fallback** via `fallback()` when none is provided (a bare `rdxDismissableLayer`). Must be
 * called in an injection context.
 */
export function injectFloatingRootContext(fallback: () => RdxFloatingRootContext): RdxFloatingRootContext {
    return inject(RDX_FLOATING_ROOT_CONTEXT, { optional: true }) ?? fallback();
}
