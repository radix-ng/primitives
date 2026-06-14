/**
 * The typed event map for the **shared tree-level coordination channel** on {@link RdxFloatingTree}.
 * Neutral by design — it ships no events initially. Each capability (hover-close, virtual focus, menu
 * coordination, list navigation) **augments** this interface via module augmentation rather than
 * emitting untyped strings:
 *
 * ```ts
 * declare module '@radix-ng/primitives/core' {
 *   interface RdxFloatingEventMap {
 *     virtualfocus: { id: string; element: HTMLElement | null };
 *   }
 * }
 * ```
 *
 * **`openchange` belongs here only per-popup, not per-tree.** Base UI emits `openchange` on the
 * per-popup `FloatingRootStore.events` (`FloatingRootStore.ts:121`), not on the shared
 * `FloatingTreeStore.events`. For open-state changes, use {@link RdxFloatingRootContextEventMap} on
 * the popup's {@link RdxFloatingRootContext.events}, not this tree-level channel.
 */
// Intentionally empty: an augmentation seed. Capabilities add keys via `declare module` augmentation,
// which only works on an `interface` — so this must stay an interface and starts with no members.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RdxFloatingEventMap {}

/**
 * The typed event map for the **per-popup events channel** on {@link RdxFloatingRootContext} —
 * the Angular counterpart of Base UI's `FloatingRootStore.events` (`FloatingRootStore.ts:121`).
 * Unlike the tree channel (one per coordinating root shared by all nested popups), this channel
 * lives **on the root context** so each popup has its own scoped emitter with no cross-popup bleed.
 */
export interface RdxFloatingRootContextEventMap {
    /** The popup's open-state changed. `reason` mirrors Base UI open-change reason strings. */
    openchange: { open: boolean; reason?: string; event?: Event };
}

/**
 * Neutral typed event channel — the Angular counterpart of Base UI's `createEventEmitter()`, typed
 * over `M` (a {@link RdxFloatingEventMap} sub-type for tree-level or a
 * {@link RdxFloatingRootContextEventMap} sub-type for per-popup).
 */
export interface RdxFloatingEvents<M extends object = RdxFloatingEventMap> {
    emit<K extends keyof M>(event: K, data: M[K]): void;
    on<K extends keyof M>(event: K, listener: (data: M[K]) => void): void;
    off<K extends keyof M>(event: K, listener: (data: M[K]) => void): void;
}

/**
 * Creates an {@link RdxFloatingEvents} emitter backed by `Map<event, Set<listener>>`, mirroring Base
 * UI's implementation: synchronous dispatch, set-deduplicated listeners, no replay.
 *
 * **Snapshot dispatch:** `emit()` snapshots the listener set before iterating so that a listener
 * calling `on()`/`off()` during dispatch does not cause skip/revisit issues.
 */
export function createFloatingEvents<M extends object = RdxFloatingEventMap>(): RdxFloatingEvents<M> {
    const listeners = new Map<string, Set<(data: never) => void>>();

    return {
        emit(event, data) {
            const set = listeners.get(event as string);
            if (!set) return;
            // Snapshot avoids mutation-during-dispatch (on()/off() in a listener).
            for (const listener of [...set]) {
                listener(data as never);
            }
        },
        on(event, listener) {
            let set = listeners.get(event as string);
            if (!set) {
                set = new Set();
                listeners.set(event as string, set);
            }
            set.add(listener as (data: never) => void);
        },
        off(event, listener) {
            listeners.get(event as string)?.delete(listener as (data: never) => void);
        }
    };
}
