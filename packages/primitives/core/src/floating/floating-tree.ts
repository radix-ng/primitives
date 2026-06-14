import { isDevMode } from '@angular/core';
import { rdxDevError } from '../dev/diagnostics';
import { createFloatingEvents, RdxFloatingEvents } from './floating-events';
import { RdxFloatingRootContext } from './floating-root-context';

/** Module-private mutable state for {@link RdxFloatingNode}, reachable only by {@link RdxFloatingTree}. */
interface RdxFloatingNodeInternals {
    parent: RdxFloatingNode | null;
    context: RdxFloatingRootContext | null;
}

/** Not exported — the only handle to a node's mutable state, so consumers cannot bypass the tree. */
const nodeInternals = new WeakMap<RdxFloatingNode, RdxFloatingNodeInternals>();

/**
 * Module-private construction key. The {@link RdxFloatingNode} constructor requires it, and its type is
 * a non-exported `unique symbol`, so consumers can neither name it (compile error) nor produce it
 * (runtime guard) — a node can only be created through {@link RdxFloatingTree.register}, never a loose
 * `new RdxFloatingNode(...)` that would exist outside `tree.all`.
 */
const NODE_CONSTRUCT_KEY = Symbol('RdxFloatingNode');

/**
 * A neutral node in the shared floating tree — the Angular counterpart of Base UI's `FloatingNode`
 * (`{ id, parentId, context? }`). It is deliberately **lightweight**: tree membership only. The
 * popup's `open` state, trigger registry, and elements live on the separate {@link
 * RdxFloatingRootContext}, exactly as Base UI splits `FloatingNode` from `FloatingRootStore`.
 *
 * `parent` and `context` are exposed **read-only**; they are mutated **only** through {@link
 * RdxFloatingTree.setParent} / {@link RdxFloatingTree.setContext} (which enforce the cycle and
 * owner-`Document` invariants). The backing state is held in a module-private `WeakMap`, so a consumer
 * cannot reach around the tree with `node.parent = …` / `node.context = …`.
 *
 * `context` may be `null` (a contextless intermediate node). Open-ness is read from the context — there
 * is no `open` on the node — and tree traversal's `onlyOpen` filter reads `node.context?.open()`,
 * mirroring Base UI's `getNodeChildren` filtering on `child.context?.open`. Presence (`mounted`) is
 * implicit: a node is mounted **iff** it is registered in the tree.
 */
export class RdxFloatingNode {
    /** Which tree (store) this node belongs to — Base UI's `externalTree`. */
    readonly tree: RdxFloatingTree;

    /** @internal — constructed only by {@link RdxFloatingTree.register} (guarded by a module-private key). */
    constructor(
        construct: typeof NODE_CONSTRUCT_KEY,
        readonly id: string,
        tree: RdxFloatingTree,
        parent: RdxFloatingNode | null,
        context: RdxFloatingRootContext | null
    ) {
        if (construct !== NODE_CONSTRUCT_KEY) {
            rdxDevError(
                'floating/direct-node-construction',
                'RdxFloatingNode is created only by RdxFloatingTree.register().',
                DOCS
            );
        }
        this.tree = tree;
        nodeInternals.set(this, { parent, context });
    }

    /** Resolved **logical** parent (DI-derived). Reassign via {@link RdxFloatingTree.setParent}. */
    get parent(): RdxFloatingNode | null {
        return nodeInternals.get(this)!.parent;
    }

    /** The per-popup root context/store. `null` for a contextless node. Reassign via `tree.setContext`. */
    get context(): RdxFloatingRootContext | null {
        return nodeInternals.get(this)!.context;
    }
}

/**
 * Discriminated parent-assignment override (ADR 0015 §1). A nullable optional would collapse
 * `undefined`/`null` in Angular signals, so "no override" (`inherit`) and "explicit independent root"
 * (`root`) must be **distinct** values — they must not both reduce to `parent == null`.
 */
export type RdxFloatingParentOverride =
    | { kind: 'inherit' } // default: resolve from the nearest DI floating context
    | { kind: 'root' } // independent root: ignore DI ancestry, node.parent = null
    | { kind: 'node'; parent: RdxFloatingNode }; // explicit parent (detached injector-subtree composition)

/** Initialization for {@link RdxFloatingTree.register}. The caller resolves `inherit` before calling. */
export interface RdxFloatingNodeInit {
    id: string;
    /** Already-resolved logical parent (`null` for a root). */
    parent: RdxFloatingNode | null;
    /** The per-popup root context. `null` for a contextless intermediate node. */
    context: RdxFloatingRootContext | null;
}

const DOCS = 'utils/floating-tree';

/** A node's open-state — read from its context (no `open` on the node itself). */
function nodeIsOpen(node: RdxFloatingNode): boolean {
    return node.context?.open() ?? false;
}

/**
 * The shared floating tree (node store) — the Angular counterpart of Base UI's `FloatingTreeStore`.
 *
 * It owns a flat set of {@link RdxFloatingNode | nodes} linked by `parent`, an adjacency index for
 * O(1) child lookup, and a neutral typed {@link RdxFloatingEvents | event channel}. It owns **neither**
 * trigger registries **nor** `open` state — those live per-popup on each {@link RdxFloatingRootContext}
 * (Base UI keeps them on the root store, not the tree store). Dismissal (ADR 0015) and the focus
 * manager (ADR 0017) read the **same** nodes, traversal, and events; neither owns the tree.
 *
 * Ancestry is **logical** (DI-derived), not DOM-derived, so portal relocation never changes ownership
 * (ADR 0015 §1). Independent roots are **not** coordinated against each other (Base UI parity): the
 * tree only answers questions *within* itself.
 *
 * **Performance:** `isRegistered()` is O(1) via `nodeSet`; `directChildren()` is O(1) via the
 * `childrenOf` adjacency map; `ancestors()` is O(depth); `children()` is O(n) total.
 */
export class RdxFloatingTree {
    /**
     * Neutral typed event channel (hover-close, virtual focus, menu coordination, list nav). Private to
     * this tree, which is scoped-by-default (one per coordinating root via `provideFloatingTree()`), so
     * events never leak across unrelated popups — matching Base UI's per-`FloatingTree` events.
     */
    readonly events: RdxFloatingEvents = createFloatingEvents();

    /** O(1) membership test and snapshot for `all`. */
    private readonly nodeSet = new Set<RdxFloatingNode>();

    /**
     * Adjacency index: maps each node (or `null` for root nodes) to its direct children in
     * registration order. Maintained in sync by `register`, `unregister`, and `setParent`.
     * Eliminates the O(n) `filter` per node in recursive traversal. Invariant: only **non-empty**
     * arrays are stored — an entry is pruned the moment its last child leaves, so a key never
     * outlives its node (see `removeFromChildrenOf`).
     */
    private readonly childrenOf = new Map<RdxFloatingNode | null, RdxFloatingNode[]>();

    /** Registers a new node. `init.parent` must already be resolved (DI layer handles `inherit`). */
    register(init: RdxFloatingNodeInit): RdxFloatingNode {
        // Structural integrity — ALWAYS (a foreign/unregistered parent corrupts the tree, not just dev misuse).
        this.assertRegisterableParent(init.parent);
        if (isDevMode()) {
            // Validate the new context against the nearest context-bearing ancestor (through any
            // contextless intermediates). A fresh node has no descendants yet. (dev-only — cheap check
            // of correct usage, not a structural invariant.)
            this.assertContextDocument(init.context, this.nearestContext(init.parent));
        }

        const node = new RdxFloatingNode(NODE_CONSTRUCT_KEY, init.id, this, init.parent, init.context);
        this.nodeSet.add(node);
        this.addToChildrenOf(init.parent, node);
        return node;
    }

    /** Removes a node from the tree. Children are **not** removed — they keep their `parent` reference. */
    unregister(node: RdxFloatingNode): void {
        if (isDevMode()) {
            this.assertOwnedNode(node);
        }
        this.nodeSet.delete(node);
        this.removeFromChildrenOf(node.parent, node);
        // `childrenOf.get(node)` (this node's OWN child list) is intentionally NOT cleared here while
        // it still has registered children: those orphans keep their `parent` ref and must be able to
        // remove themselves later. The key is pruned automatically once the last orphan unregisters
        // (removeFromChildrenOf deletes empty lists), so the node is not retained. Orphans are never
        // reached by traversal meanwhile, since isRegistered(node) = false.
    }

    /**
     * Associates / re-associates / clears a node's root context after registration (Base UI attaches
     * the context once the floating element resolves). Validates the new context's owner-`Document`
     * against the nearest context-bearing **ancestor** (through contextless intermediates) **and**
     * every context-bearing **descendant**, so a contextless intermediate can never bridge two
     * documents. Allows the `null → context → null` lifecycle.
     */
    setContext(node: RdxFloatingNode, context: RdxFloatingRootContext | null): void {
        // Structural integrity — ALWAYS (mutating a foreign node corrupts another tree).
        this.assertOwnedNode(node);
        if (isDevMode() && context !== null) {
            // dev-only: expensive ancestry/subtree document validation.
            this.assertContextDocument(context, this.nearestContext(node.parent));
            for (const dc of this.descendantContexts(node)) {
                this.assertContextDocument(context, dc);
            }
        }

        nodeInternals.get(node)!.context = context;
    }

    /** Reparents an existing node (detached composition / explicit `node` override), with cycle guard. */
    setParent(node: RdxFloatingNode, parent: RdxFloatingNode | null): void {
        // Structural integrity — ALWAYS (a foreign node, or a foreign/unregistered parent, corrupts the tree).
        this.assertOwnedNode(node);
        this.assertRegisterableParent(parent);

        // No-op reparent: the parent is unchanged, so there is nothing to do — and crucially we must
        // NOT fall through, because removeFromChildrenOf + addToChildrenOf would move `node` to the
        // END of its sibling list, silently changing traversal/focus order (Base UI keeps node order
        // stable). The guards above still run, so a foreign/unregistered node is rejected first.
        if (node.parent === parent) {
            return;
        }

        // The cycle check is ALSO structural — a cycle would make traversal (children / ancestors /
        // nearestContext) recurse/loop forever — so it runs in production too. Walk the
        // prospective parent chain (stopping at an unregistered node, like `ancestors`); reaching `node`
        // means an ancestry cycle. O(depth).
        for (let ancestor = parent; ancestor !== null && this.nodeSet.has(ancestor); ancestor = ancestor.parent) {
            if (ancestor === node) {
                rdxDevError(
                    'floating/parent-cycle',
                    `Reparenting node "${node.id}" under "${parent?.id}" creates an ancestry cycle.`,
                    DOCS
                );
            }
        }

        if (isDevMode()) {
            // dev-only: validate the WHOLE subtree against the new ancestry.
            this.assertSubtreeDocuments(node, parent);
        }

        const oldParent = node.parent; // capture before updating internals
        nodeInternals.get(node)!.parent = parent;
        this.removeFromChildrenOf(oldParent, node);
        this.addToChildrenOf(parent, node);
    }

    /**
     * Direct + transitive children, in registration order. The `onlyOpen` filter (default `true`)
     * filters the **result** by each node's `context?.open()` lifecycle but **never** aborts recursion
     * at a closed node, so a keep-mounted/closed parent never hides an open grandchild (Base UI
     * `getNodeChildren`, ADR 0015 §1 traversal contract).
     *
     * Dismissal children queries pass `onlyOpen: true` (the `hasBlockingChild` pattern in the
     * capability). The focus manager's focus-return check passes `onlyOpen: false` explicitly (Base UI
     * `FloatingFocusManager.tsx:842`) — so focus inside a closed-but-mounted descendant still counts as
     * "inside the tree". Always pass `onlyOpen` explicitly for non-dismissal paths; do not inherit the
     * default.
     */
    children(node: RdxFloatingNode, options: { onlyOpen?: boolean } = {}): RdxFloatingNode[] {
        if (isDevMode()) {
            this.assertOwnedNode(node);
        }
        const onlyOpen = options.onlyOpen ?? true;
        const result: RdxFloatingNode[] = [];

        const collect = (parent: RdxFloatingNode): void => {
            for (const candidate of this.directChildren(parent)) {
                if (!onlyOpen || nodeIsOpen(candidate)) {
                    result.push(candidate);
                }
                // Recurse regardless of the candidate's open-ness (never abort at a closed node).
                collect(candidate);
            }
        };

        collect(node);
        return result;
    }

    /**
     * Logical ancestors of `node`, nearest first (Base UI `getNodeAncestors`). The walk **stops at an
     * unregistered node**: Base UI resolves ancestry by `parentId` lookup in the live nodes array, so
     * unregistering a parent breaks the chain (a removed middle node truncates ancestry — its children
     * keep the raw `parent` identity but it no longer appears as an ancestor). This avoids a "ghost"
     * ancestor lingering in DI-ownership / document / dismissal/focus traversal when Angular destroys a
     * parent before its child.
     */
    ancestors(node: RdxFloatingNode): RdxFloatingNode[] {
        if (isDevMode()) {
            this.assertOwnedNode(node);
        }
        const result: RdxFloatingNode[] = [];
        for (let current = node.parent; current !== null && this.nodeSet.has(current); current = current.parent) {
            result.push(current);
        }
        return result;
    }

    /** Snapshot of all registered nodes (debugging / diagnostics). Registration order is preserved. */
    get all(): readonly RdxFloatingNode[] {
        return [...this.nodeSet];
    }

    // ─── Private adjacency helpers ───────────────────────────────────────────

    /** Direct children of `parent` in registration order. O(1) via the adjacency map. */
    private directChildren(parent: RdxFloatingNode): RdxFloatingNode[] {
        return this.childrenOf.get(parent) ?? [];
    }

    private addToChildrenOf(parent: RdxFloatingNode | null, node: RdxFloatingNode): void {
        let children = this.childrenOf.get(parent);
        if (!children) {
            children = [];
            this.childrenOf.set(parent, children);
        }
        children.push(node);
    }

    private removeFromChildrenOf(parent: RdxFloatingNode | null, node: RdxFloatingNode): void {
        const children = this.childrenOf.get(parent);
        if (!children) return;
        const idx = children.indexOf(node);
        if (idx !== -1) children.splice(idx, 1);
        // Prune the now-empty list so its `parent` key (a STRONG ref to a node) is released. Without
        // this an unregistered node that ever had a child lingers as a map key forever — retaining the
        // node → context → floating/reference DOM elements (a leak that grows on every nested
        // mount/unmount). `childrenOf` therefore only ever holds non-empty arrays.
        if (children.length === 0) {
            this.childrenOf.delete(parent);
        }
    }

    // ─── Private traversal helpers ───────────────────────────────────────────

    /**
     * Nearest context-bearing node walking up from `node` (inclusive), skipping contextless ancestors.
     * Stops at an unregistered node (same ghost-ancestry rule as {@link ancestors}).
     */
    private nearestContext(node: RdxFloatingNode | null): RdxFloatingRootContext | null {
        for (let current = node; current !== null && this.nodeSet.has(current); current = current.parent) {
            if (current.context !== null) {
                return current.context;
            }
        }
        return null;
    }

    /** All contexts among `node`'s transitive descendants (skips `node` itself). */
    private descendantContexts(node: RdxFloatingNode): RdxFloatingRootContext[] {
        return this.children(node, { onlyOpen: false })
            .map((descendant) => descendant.context)
            .filter((context): context is RdxFloatingRootContext => context !== null);
    }

    /**
     * Dev-only: validates every context in `node`'s subtree (node + transitive descendants) against
     * the nearest context-bearing ancestor walking up from `newParent`. Shared between `setParent`
     * (moves a subtree under a new parent) to keep the document-consistency rule in one place.
     */
    private assertSubtreeDocuments(node: RdxFloatingNode, newParent: RdxFloatingNode | null): void {
        const ancestorCtx = this.nearestContext(newParent);
        this.assertContextDocument(node.context, ancestorCtx);
        for (const dc of this.descendantContexts(node)) {
            this.assertContextDocument(dc, ancestorCtx);
        }
    }

    // ─── Private invariant guards ─────────────────────────────────────────────

    /** Whether `node` is currently registered in this tree. O(1). */
    private isRegistered(node: RdxFloatingNode): boolean {
        return this.nodeSet.has(node);
    }

    /**
     * Guards that `node` actually belongs to **this** tree and is still registered — so a tree can
     * never mutate/traverse a node owned by another tree (which would leave `node.tree` pointing
     * elsewhere while its ancestry leads here) or one that was already unregistered.
     */
    private assertOwnedNode(node: RdxFloatingNode): void {
        if (node.tree !== this || !this.nodeSet.has(node)) {
            rdxDevError(
                'floating/foreign-node',
                'This node does not belong to this tree (or was already unregistered).',
                DOCS
            );
        }
    }

    /** A parent (when given) must belong to this tree **and** still be registered. */
    private assertRegisterableParent(parent: RdxFloatingNode | null): void {
        if (parent !== null) {
            if (parent.tree !== this) {
                rdxDevError('floating/cross-tree-parent', 'A floating node parent must belong to the same tree.', DOCS);
            }
            if (!this.nodeSet.has(parent)) {
                rdxDevError(
                    'floating/unregistered-parent',
                    'A floating node parent must be currently registered in the tree.',
                    DOCS
                );
            }
        }
    }

    /** Owner-`Document` consistency between a node's context and a related (ancestor/descendant) context. */
    private assertContextDocument(
        context: RdxFloatingRootContext | null,
        relatedContext: RdxFloatingRootContext | null
    ): void {
        if (context !== null && relatedContext !== null && context.ownerDocument !== relatedContext.ownerDocument) {
            rdxDevError(
                'floating/cross-document-parent',
                'A floating node must share the same ownerDocument as its ancestry/subtree.',
                DOCS
            );
        }
    }
}
