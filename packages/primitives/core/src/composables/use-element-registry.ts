import {
    afterEveryRender,
    computed,
    DestroyRef,
    effect,
    inject,
    Injector,
    Signal,
    signal,
    untracked
} from '@angular/core';
import { compareNodeDocumentPosition, getAdjacentNodeRoots, sortByDocumentPosition } from '../dom/element-order';

export interface RdxElementRegistryItem {
    readonly element: HTMLElement;
}

/** Registration and document order, independent of focus, selection, filtering and keyboard policy. */
export interface RdxElementRegistry<T extends RdxElementRegistryItem> {
    readonly items: Signal<T[]>;
    readonly elements: Signal<HTMLElement[]>;
    register(item: T): () => void;
    /** Remove this owner only; an older owner cannot remove a replacement registration. */
    unregister(owner: T): void;
    /** Replace an existing element's payload without changing its registration lifetime or index. */
    update(item: T): boolean;
    indexOf(element: HTMLElement): number;
    /** Synchronize after a DOM change made outside Angular's rendering. */
    refresh(): void;
}

/**
 * Shared collection infrastructure. DI adapters supply registrations across component/projection
 * boundaries. Metadata may contain signals; consumers read them without invalidating DOM indices.
 * Registering N items mutates one stable Map and publishes one batched collection snapshot.
 */
export function useElementRegistry<T extends RdxElementRegistryItem>(
    options: { injector?: Injector } = {}
): RdxElementRegistry<T> {
    const injector = options.injector ?? inject(Injector);
    const registrations = new Map<HTMLElement, { owner: T; item: T; token: object }>();
    const membership = signal(0);
    const order = signal(0);
    const payload = signal(0);
    let destroyed = false;
    let observer: MutationObserver | undefined;
    let roots = new Set<Node>();

    const elements = computed(
        () => {
            membership();
            order();
            return sortByDocumentPosition([...registrations.values()].map((record) => record.item)).map(
                (item) => item.element
            );
        },
        { equal: sameOrder }
    );
    const items = computed(
        () => {
            membership();
            payload();
            return elements().map((element) => registrations.get(element)!.item);
        },
        { equal: sameOrder }
    );
    const indices = computed(() => new Map(elements().map((element, index) => [element, index])));

    const observe = (nodes: readonly HTMLElement[]) => {
        const nextRoots = new Set<Node>(getAdjacentNodeRoots(nodes));
        // Parent observation also handles one item and disconnection/reconnection, where there is
        // no adjacent pair. The common ancestors additionally detect moving whole wrapper groups.
        for (const element of registrations.keys()) if (element.parentNode) nextRoots.add(element.parentNode);
        if (!nextRoots.size && registrations.size) return;
        if (nextRoots.size === roots.size && [...nextRoots].every((root) => roots.has(root))) return;
        observer?.disconnect();
        roots = nextRoots;
        if (!roots.size) return;
        const Observer = registrations.keys().next().value?.ownerDocument.defaultView?.MutationObserver;
        if (!Observer) return;
        observer = new Observer(() => untracked(refresh));
        for (const root of roots) observer.observe(root, { childList: true });
    };

    const refresh = () => {
        if (destroyed) return;
        const current = untracked(elements);
        let connected = 0;
        for (const element of registrations.keys()) if (element.isConnected) connected++;
        if (
            connected !== current.length ||
            current.some(
                (element, index) =>
                    !element.isConnected || (index > 0 && compareNodeDocumentPosition(current[index - 1], element) > 0)
            )
        )
            order.update((value) => value + 1);
        observe(untracked(elements));
    };
    // Start/re-scope observation even when no template consumes the collection snapshot.
    effect(
        () => {
            membership();
            untracked(refresh);
        },
        { injector }
    );
    // Tracked @for can move native nodes without recreating the registering directive. Read after
    // Angular renders, before another interaction; the observer covers external moves as well.
    afterEveryRender(() => untracked(refresh), { injector });
    injector.get(DestroyRef).onDestroy(() => {
        destroyed = true;
        observer?.disconnect();
        roots.clear();
        registrations.clear();
        membership.update((value) => value + 1);
    });

    const remove = (element: HTMLElement) => {
        registrations.delete(element);
        membership.update((value) => value + 1);
    };
    return {
        items,
        elements,
        register(item) {
            if (destroyed) return () => {};
            const previous = registrations.get(item.element);
            const token = {};
            registrations.set(item.element, { owner: item, item, token });
            if (!previous) membership.update((value) => value + 1);
            else if (previous.item !== item) payload.update((value) => value + 1);
            return () => {
                if (registrations.get(item.element)?.token === token) remove(item.element);
            };
        },
        unregister(owner) {
            if (registrations.get(owner.element)?.owner === owner) remove(owner.element);
        },
        update(item) {
            const record = registrations.get(item.element);
            if (!record || destroyed) return false;
            if (record.item !== item) {
                record.item = item;
                payload.update((value) => value + 1);
            }
            return true;
        },
        indexOf: (element) => indices().get(element) ?? -1,
        refresh
    };
}

function sameOrder<T>(previous: readonly T[], next: readonly T[]): boolean {
    return previous.length === next.length && previous.every((item, index) => item === next[index]);
}
