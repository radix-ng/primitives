/**
 * The typed event map for the shared floating channel. Neutral by design: it ships only the base
 * `openchange` event, and each capability (hover-close, virtual focus, menu coordination, list
 * navigation) **augments** this interface via module augmentation rather than emitting untyped strings:
 *
 * ```ts
 * declare module '@radix-ng/primitives/core' {
 *   interface RdxFloatingEventMap {
 *     'virtualfocus': { id: string; element: HTMLElement | null };
 *   }
 * }
 * ```
 *
 * Pinning the map up front (ADR 0015 §1, pillar 4) is what lets later consumers extend the channel
 * type-safely instead of changing the fundamental tree API once `any` payloads have spread.
 */
export interface RdxFloatingEventMap {
    /**
     * The popup's open-state changed. Neutral, matching Base UI's tree events — the tree is
     * scoped-by-default (one per coordinating root, not application-wide), so events do not leak
     * across unrelated popups and an event need not carry node identity. `reason` mirrors Base UI's
     * open-change reason strings.
     */
    openchange: { open: boolean; reason?: string; event?: Event };
}

/**
 * Neutral typed event channel shared by every floating capability — the Angular counterpart of Base
 * UI's `FloatingTreeStore.events` (`createEventEmitter`), keyed by {@link RdxFloatingEventMap}.
 */
export interface RdxFloatingEvents {
    emit<K extends keyof RdxFloatingEventMap>(event: K, data: RdxFloatingEventMap[K]): void;
    on<K extends keyof RdxFloatingEventMap>(event: K, listener: (data: RdxFloatingEventMap[K]) => void): void;
    off<K extends keyof RdxFloatingEventMap>(event: K, listener: (data: RdxFloatingEventMap[K]) => void): void;
}

/**
 * Creates a {@link RdxFloatingEvents} emitter backed by a `Map<event, Set<listener>>`, mirroring Base
 * UI's implementation exactly: synchronous dispatch, set-deduplicated listeners, no replay.
 */
export function createFloatingEvents(): RdxFloatingEvents {
    const listeners = new Map<string, Set<(data: never) => void>>();

    return {
        emit(event, data) {
            listeners.get(event as string)?.forEach((listener) => listener(data as never));
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
