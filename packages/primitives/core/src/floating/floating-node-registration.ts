import { injectId } from '../id-generator';
import {
    provideFloatingRegistration,
    RDX_FLOATING_REGISTRATION,
    RdxFloatingRegistrationContext
} from './floating-registration';
import { RdxFloatingNode, RdxFloatingParentOverride, RdxFloatingTree } from './floating-tree';
import { RDX_FLOATING_ROOT_CONTEXT, RDX_FLOATING_TREE } from './provide-floating-tree';
import { Directive, effect, inject, input, Signal } from '@angular/core';

/**
 * Registers a {@link RdxFloatingNode} into the shared {@link RdxFloatingTree} for its DI subtree and
 * propagates the registration handle to descendants — the reusable Angular counterpart of mounting a
 * Base UI `<FloatingNode>` (ADR 0015 §1, Phase 1). It is the **single** place that runs the handle
 * pattern; the dismissal capability (ADR 0015) and the focus manager (ADR 0017) **consume** the node /
 * context / tree it registers, they do not re-implement registration.
 *
 * **What it owns vs. what it reads.** It provides its own {@link RdxFloatingRegistrationContext} (so
 * descendants resolve it with `skipSelf`) and registers/unregisters a node reactively. It does **not**
 * create the tree or the root context — a coordination-boundary primitive root supplies those
 * (`provideFloatingTree()` inherit-or-create + `provideFloatingRootContext()`); this directive injects
 * them. With **no** enclosing tree it runs **node-optional** (`status() === 'detached'`, `node() ===
 * null`), reading its context directly — the standalone `rdxDismissableLayer` case.
 *
 * **Resolution (per {@link RdxFloatingParentOverride}).** Only an `inherit` node depends on the DI
 * parent, so only it waits on a `pending` parent; `root` / `node` overrides are independent and register
 * immediately. The node carries the injected {@link RDX_FLOATING_ROOT_CONTEXT} (or `null` for a
 * contextless intermediate). All teardown (re-resolution **and** destroy) unregisters the node and
 * reverts the handle.
 */
@Directive({
    selector: '[rdxFloatingNode]',
    exportAs: 'rdxFloatingNode',
    providers: [provideFloatingRegistration()]
})
export class RdxFloatingNodeRegistration {
    /** Explicit tree for detached sibling composition — Base UI's `externalTree`. */
    readonly externalTree = input<RdxFloatingTree | null>(null);
    /** How this node's logical parent is resolved. Defaults to `inherit` (nearest DI ancestor). */
    readonly parentOverride = input<RdxFloatingParentOverride>({ kind: 'inherit' });

    /** Own handle — the WRITER side (concrete class); this directive is the only writer. */
    private readonly selfReg = inject(RdxFloatingRegistrationContext);
    /** Nearest ancestor handle — the READER side (reader-typed token), or `null` at the top. */
    private readonly parentReg = inject(RDX_FLOATING_REGISTRATION, { optional: true, skipSelf: true });
    /** The enclosing tree, if a coordination boundary provided one (else node-optional). */
    private readonly ambientTree = inject(RDX_FLOATING_TREE, { optional: true });
    /** This node's per-popup context, or `null` for a contextless intermediate node. */
    private readonly rootContext = inject(RDX_FLOATING_ROOT_CONTEXT, { optional: true });
    private readonly nodeId = injectId('rdx-floating-node-');

    /** This directive's node once registered (`null` while `pending` / `detached`). */
    readonly node: Signal<RdxFloatingNode | null> = this.selfReg.node;
    /** Lifecycle phase of this directive's registration (`pending` | `detached` | `registered`). */
    readonly status = this.selfReg.status;
    /** The tree this node joined (`null` until `registered`). */
    readonly tree: Signal<RdxFloatingTree | null> = this.selfReg.tree;

    constructor() {
        effect((onCleanup) => {
            const override = this.parentOverride();

            // Only `inherit` depends on the DI parent → only it waits on a `pending` parent (reading
            // status() subscribes us, so we re-run when the parent resolves). `root` / `node` overrides
            // are independent of the DI ancestor and register immediately.
            if (override.kind === 'inherit' && this.parentReg?.status() === 'pending') {
                return;
            }

            // Logical parent: explicit for `node`, `null` for `root`, the DI parent for `inherit`
            // (a `detached` parent reads `null` → this node becomes a root within its tree).
            const parentNode =
                override.kind === 'node'
                    ? override.parent
                    : override.kind === 'root'
                      ? null
                      : (this.parentReg?.node() ?? null);

            // Tree selection (resolveFloatingTree's logic, replicated because inject() is illegal inside
            // effect()): a `node` override must join its parent's tree.
            const resolvedTree =
                (override.kind === 'node' ? override.parent.tree : null) ??
                this.externalTree() ??
                this.parentReg?.tree() ??
                this.ambientTree;

            if (!resolvedTree) {
                this.selfReg.markDetached(); // node-optional: resolved, but no tree → no node
                return;
            }

            const node = resolvedTree.register({
                id: this.nodeId,
                parent: parentNode,
                context: this.rootContext
            });
            this.selfReg.register(resolvedTree, node);

            onCleanup(() => {
                resolvedTree.unregister(node);
                this.selfReg.clear(); // transient: back to `pending` until the effect re-resolves
            });
        });
    }
}
