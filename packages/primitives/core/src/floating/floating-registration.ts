import { rdxDevError } from '../dev/diagnostics';
import type { RdxFloatingNode, RdxFloatingTree } from './floating-tree';
import { computed, InjectionToken, Provider, Signal, signal } from '@angular/core';

const DOCS = 'utils/floating-tree';

/** The three lifecycle phases of a {@link RdxFloatingRegistrationContext} (see {@link RegistrationState}). */
export type RdxFloatingRegistrationStatus = 'pending' | 'detached' | 'registered';

/**
 * The handle's lifecycle as a **discriminated union** — three states a nullable payload would conflate:
 *
 * - **`pending`** — the directive's `effect()` has not resolved yet (the initial state, and the
 *   transient window between an `onCleanup` and the next re-resolution). A child observing a `pending`
 *   parent must **wait** — its own effect re-runs reactively when the parent's `status` flips — and must
 *   **not** treat the parent as absent and fall back to the ambient tree / become a root.
 * - **`detached`** — the directive resolved and deliberately has **no node** (node-optional: no tree was
 *   available, e.g. a standalone `rdxDismissableLayer`). A child treats a `detached` parent as absent
 *   (logical parent `null`).
 * - **`registered`** — joined `tree` as `node`. The only state carrying a payload, and the only one
 *   where `node`/`tree` read non-null; `node.tree === tree` holds because both are set together.
 *
 * The `pending` vs `detached` split is the whole point: "still resolving" and "resolved, no node" must
 * be distinguishable, or a child races and transiently mis-registers as a root in the wrong tree.
 */
type RegistrationState =
    | { readonly status: 'pending' }
    | { readonly status: 'detached' }
    | { readonly status: 'registered'; readonly tree: RdxFloatingTree; readonly node: RdxFloatingNode };

/**
 * The **read-only projection** of a registration handle — what a **descendant** injects (it reads its
 * nearest ancestor's handle to resolve its logical parent, ADR 0015 §1). It deliberately exposes only
 * the reactive reads (`status` / `tree` / `node`) and **not** the writers (`register` / `markDetached` /
 * `clear`), which belong solely to the directive that owns the handle: a descendant must never be able
 * to clear or re-point its parent's registration. The {@link RDX_FLOATING_REGISTRATION} token is typed
 * as this reader, so the ergonomic, cast-free injection path is read-only; the owning directive uses the
 * concrete {@link RdxFloatingRegistrationContext} type (the writer) for its own handle.
 */
export interface RdxFloatingRegistrationReader {
    readonly status: Signal<RdxFloatingRegistrationStatus>;
    readonly tree: Signal<RdxFloatingTree | null>;
    readonly node: Signal<RdxFloatingNode | null>;
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
 * {@link RegistrationState} signal; `register(tree, node)` sets the `registered` payload after asserting
 * `node.tree === tree`, `markDetached()` records "resolved, no node", and `clear()` reverts to
 * `pending`. The `tree`/`node`/`status` reads are `computed()` over that one signal, so they can never
 * disagree.
 *
 * **Registration directive usage pattern:**
 *
 * ```ts
 * @Directive({ providers: [provideFloatingRegistration()] })
 * class SomeFloatingDirective {
 *   // Own handle — the WRITER side. Inject the concrete type so register()/markDetached()/clear() are
 *   // available; this is the only place that writes this handle.
 *   private readonly selfReg = inject(RdxFloatingRegistrationContext);
 *   // Parent handle — the READER side (token is reader-typed). A descendant can read status/tree/node
 *   // but cannot mutate the parent's registration.
 *   private readonly parentReg  = inject(RDX_FLOATING_REGISTRATION, { optional: true, skipSelf: true });
 *   private readonly ambientTree = inject(RDX_FLOATING_TREE, { optional: true });
 *
 *   constructor() {
 *     effect((onCleanup) => {
 *       const override = this.parentOverride(); // { kind: 'inherit' | 'root' | 'node' }
 *
 *       // ONLY an `inherit` node depends on the DI parent, so only it waits on a `pending` parent (a
 *       // `pending` parent is NOT "no parent"; reading status() subscribes us, so we re-run when it
 *       // flips). `root` / `node` overrides are independent of the DI ancestor and register NOW —
 *       // waiting on the DI parent would wrongly stall them, or strand them if that parent is destroyed.
 *       if (override.kind === 'inherit' && this.parentReg?.status() === 'pending') return;
 *
 *       // Logical parent from the override (DI parent only for `inherit`; a `detached` parent reads
 *       // null → this node becomes a root in its tree).
 *       const parentNode =
 *         override.kind === 'node' ? override.parent
 *         : override.kind === 'root' ? null
 *         : (this.parentReg?.node() ?? null); // 'inherit'
 *
 *       // Tree selection (resolveFloatingTree's logic; inject() is illegal inside effect()). A `node`
 *       // override must join its parent's tree.
 *       const externalTree = this.externalTreeInput(); // input() signal
 *       const resolvedTree =
 *         (override.kind === 'node' ? override.parent.tree : undefined) ??
 *         externalTree ?? this.parentReg?.tree() ?? this.ambientTree;
 *       if (!resolvedTree) {
 *         this.selfReg.markDetached(); // node-optional: resolved, but no tree → no node
 *         return;
 *       }
 *
 *       const node = resolvedTree.register({ id: ..., parent: parentNode, context: ... });
 *       this.selfReg.register(resolvedTree, node);
 *
 *       onCleanup(() => {
 *         resolvedTree.unregister(node);
 *         this.selfReg.clear(); // transient: back to 'pending' until the effect re-resolves
 *       });
 *     });
 *   }
 * }
 * ```
 */
export class RdxFloatingRegistrationContext implements RdxFloatingRegistrationReader {
    private readonly _state = signal<RegistrationState>({ status: 'pending' });

    /**
     * Lifecycle phase: `pending` (resolving — children must wait), `detached` (resolved, node-optional),
     * or `registered`. A `computed()` over the one internal state signal. See {@link RegistrationState}.
     */
    readonly status: Signal<RdxFloatingRegistrationStatus> = computed(() => this._state().status);

    /**
     * The tree this directive joined, or `null` unless `status() === 'registered'`. A `computed()`
     * derived from the internal state — always consistent with {@link node} and {@link status}.
     */
    readonly tree: Signal<RdxFloatingTree | null> = computed(() => {
        const state = this._state();
        return state.status === 'registered' ? state.tree : null;
    });

    /**
     * The node this directive registered, or `null` unless `status() === 'registered'`. A `computed()`
     * derived from the internal state — always consistent with {@link tree}
     * (`node.tree === tree` is invariant in the `registered` state).
     */
    readonly node: Signal<RdxFloatingNode | null> = computed(() => {
        const state = this._state();
        return state.status === 'registered' ? state.node : null;
    });

    /**
     * Atomically records the resolved tree and the registered node (`status → 'registered'`). Asserts
     * `node.tree === tree` so no state where `tree` and `node` point to different stores can exist.
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
        this._state.set({ status: 'registered', tree, node });
    }

    /**
     * Records that the directive **resolved but has no node** (`status → 'detached'`): node-optional —
     * no tree was available (e.g. a standalone `rdxDismissableLayer`). Distinct from `pending`: a child
     * treats a `detached` parent as absent (inherits `null`), whereas it must **wait** on a `pending` one.
     */
    markDetached(): void {
        this._state.set({ status: 'detached' });
    }

    /**
     * Reverts to `pending` (the `onCleanup` counterpart of {@link register} / {@link markDetached}).
     * Called after `tree.unregister(node)` so the handle re-enters the "resolving" phase until the
     * directive's effect re-runs; `tree`/`node` read `null` again.
     */
    clear(): void {
        this._state.set({ status: 'pending' });
    }
}

/**
 * DI token for the nearest ancestor's registration handle, **typed as the read-only
 * {@link RdxFloatingRegistrationReader}**. A descendant injects it with `{ optional: true, skipSelf:
 * true }` to read its parent's `status` / `tree` / `node` — and, because the token is reader-typed,
 * **cannot** call the parent's writers (`register` / `markDetached` / `clear`) without a deliberate
 * cast. The owning directive writes through its own handle, which it injects by the concrete
 * {@link RdxFloatingRegistrationContext} type instead (see {@link provideFloatingRegistration}).
 */
export const RDX_FLOATING_REGISTRATION = new InjectionToken<RdxFloatingRegistrationReader>('RdxFloatingRegistration');

/**
 * Seals a fresh registration handle into this directive's injector at creation time. Returns **two**
 * providers backed by **one** instance: the concrete {@link RdxFloatingRegistrationContext} (the
 * writer, injected by the owning directive) and a reader-typed {@link RDX_FLOATING_REGISTRATION} alias
 * (`useExisting`) that descendants inject. Splitting writer from reader is what stops a descendant from
 * mutating its parent's registration. Call this in a directive's `providers` array; the directive then
 * calls `selfReg.register(tree, node)` / `markDetached()` / `clear()` on its own (writer) handle.
 */
export function provideFloatingRegistration(): Provider[] {
    return [
        { provide: RdxFloatingRegistrationContext, useFactory: () => new RdxFloatingRegistrationContext() },
        { provide: RDX_FLOATING_REGISTRATION, useExisting: RdxFloatingRegistrationContext }
    ];
}
