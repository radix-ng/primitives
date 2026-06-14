import { computed, InjectionToken, Provider, signal, Signal } from '@angular/core';
import { rdxDevError } from '../dev/diagnostics';
import type { RdxFloatingNode, RdxFloatingTree } from './floating-tree';

const DOCS = 'utils/floating-tree';

/** Atomic payload — always set or cleared together, so `node.tree === tree` is always true. */
interface RegistrationState {
    readonly tree: RdxFloatingTree;
    readonly node: RdxFloatingNode;
}

/**
 * A **stable DI handle** created at injector formation time and filled in at runtime once the
 * registration directive resolves its `externalTree` / `parentOverride` inputs.
 *
 * **Why a handle, not direct token replacement.** Angular injectors are sealed at creation — a
 * directive that resolves its tree from a runtime `externalTree` input cannot change what
 * `RDX_FLOATING_TREE` resolves to for its subtree afterwards. The handle is the object that _is_
 * provided at creation; its internal state signal changes at runtime. Descendants inject the handle
 * (with `skipSelf: true`) and read `parentReg.tree()` / `parentReg.node()` reactively — they never
 * depend on tokens being swapped post-construction.
 *
 * **Atomicity.** `tree` and `node` are **not** separate `WritableSignal`s — independent `.set()`
 * calls would create intermediate states where `node.tree !== tree`. Instead there is **one** private
 * state signal; `register(tree, node)` sets both together after asserting `node.tree === tree`, and
 * `clear()` nulls both together.
 *
 * **Registration directive usage pattern:**
 *
 * ```ts
 * @Directive({ providers: [provideFloatingRegistration()] })
 * class SomeFloatingDirective {
 *   private readonly selfReg    = inject(RDX_FLOATING_REGISTRATION);
 *   private readonly parentReg  = inject(RDX_FLOATING_REGISTRATION, { optional: true, skipSelf: true });
 *   private readonly ambientTree = inject(RDX_FLOATING_TREE, { optional: true });
 *
 *   constructor() {
 *     effect((onCleanup) => {
 *       // `resolveFloatingTree(externalTree)` calls `inject()` — only legal at construction time,
 *       // not inside effect(). Here we replicate its logic with already-captured fields instead.
 *       const externalTree = this.externalTreeInput();        // input() signal
 *       const resolvedTree = externalTree ?? this.parentReg?.tree() ?? this.ambientTree;
 *       const parentNode   = this.parentReg?.node() ?? null; // for 'inherit'
 *
 *       if (!resolvedTree) return; // node-optional: standalone with no tree
 *
 *       const node = resolvedTree.register({ id: ..., parent: parentNode, context: ... });
 *       this.selfReg.register(resolvedTree, node);
 *
 *       onCleanup(() => {
 *         resolvedTree.unregister(node);
 *         this.selfReg.clear();
 *       });
 *     });
 *   }
 * }
 * ```
 */
export class RdxFloatingRegistrationContext {
    private readonly _state = signal<RegistrationState | null>(null);

    /**
     * The tree this directive joined, or `null` before `register()` is called. A `computed()` derived
     * from the internal state — always consistent with {@link node}.
     */
    readonly tree: Signal<RdxFloatingTree | null> = computed(() => this._state()?.tree ?? null);

    /**
     * The node this directive registered, or `null` before `register()` is called. A `computed()`
     * derived from the internal state — always consistent with {@link tree}
     * (`node.tree === tree` is invariant).
     */
    readonly node: Signal<RdxFloatingNode | null> = computed(() => this._state()?.node ?? null);

    /**
     * Atomically records the resolved tree and the registered node. Asserts `node.tree === tree`
     * so no intermediate state where `tree` and `node` point to different stores can exist.
     * Called by the directive inside `effect()` after `tree.register(…)` succeeds.
     */
    register(tree: RdxFloatingTree, node: RdxFloatingNode): void {
        if (node.tree !== tree) {
            rdxDevError(
                'floating/registration-mismatch',
                `register(tree, node): node.tree must equal tree. ` + `Node "${node.id}" belongs to a different tree.`,
                DOCS
            );
        }
        this._state.set({ tree, node });
    }

    /**
     * Clears both tree and node atomically (the `onCleanup` counterpart of {@link register}).
     * Called after `tree.unregister(node)` so the handle reverts to the null state.
     */
    clear(): void {
        this._state.set(null);
    }
}

/**
 * DI token for the nearest ancestor's {@link RdxFloatingRegistrationContext}. Each registration
 * directive provides one instance (via {@link provideFloatingRegistration}) and fills it after
 * resolving its inputs. Descendants inject with `{ optional: true, skipSelf: true }` to find the
 * nearest parent's handle — not the directive's own.
 */
export const RDX_FLOATING_REGISTRATION = new InjectionToken<RdxFloatingRegistrationContext>('RdxFloatingRegistration');

/**
 * Creates a {@link Provider} that seals a fresh {@link RdxFloatingRegistrationContext} into this
 * directive's injector at creation time. Call this in a directive's `providers` array; the directive
 * then calls `selfReg.register(tree, node)` and `selfReg.clear()` to manage the handle lifecycle.
 */
export function provideFloatingRegistration(): Provider {
    return { provide: RDX_FLOATING_REGISTRATION, useFactory: () => new RdxFloatingRegistrationContext() };
}
