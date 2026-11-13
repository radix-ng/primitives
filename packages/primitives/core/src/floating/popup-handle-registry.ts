import { signal } from '@angular/core';

export interface RdxPopupHandleTrigger<Payload, Data = undefined> {
    element: HTMLElement;
    payload: () => Payload | undefined;
    data?: Data;
}

/** Connect detached triggers to the current popup owner, preserving registration lifetimes. */
export function createPopupHandleRegistry<Root, Payload, Data = undefined>(
    connect: (root: Root, id: string, trigger: RdxPopupHandleTrigger<Payload, Data>) => () => void
) {
    const root = signal<Root | undefined>(undefined);
    const owners: { root: Root }[] = [];
    const triggers = new Map<string, RdxPopupHandleTrigger<Payload, Data>>();
    const connections = new Map<string, () => void>();
    const disconnect = () => {
        for (const cleanup of connections.values()) cleanup();
        connections.clear();
    };
    const activate = (owner: Root | undefined) => {
        if (root() === owner) return;
        disconnect();
        root.set(owner);
        if (owner) {
            for (const [id, trigger] of triggers) connections.set(id, connect(owner, id, trigger));
        }
    };
    return {
        root: root.asReadonly(),
        trigger: (id: string) => triggers.get(id),
        registerRoot(owner: Root) {
            // Roots can overlap during a view transition. The newest registration controls the
            // handle; removing it restores the surviving owner without remounting its triggers.
            const registration = { root: owner };
            owners.push(registration);
            activate(owner);
            return () => {
                const index = owners.indexOf(registration);
                if (index === -1) return;
                owners.splice(index, 1);
                activate(owners.at(-1)?.root);
            };
        },
        registerTrigger(id: string, element: HTMLElement, payload: () => Payload | undefined, data?: Data) {
            connections.get(id)?.();
            connections.delete(id);
            const trigger = { element, payload, data };
            triggers.set(id, trigger);
            const owner = root();
            if (owner) connections.set(id, connect(owner, id, trigger));
            return () => {
                // A stale cleanup must never disconnect the replacement registered with this id.
                if (triggers.get(id) !== trigger) return;
                connections.get(id)?.();
                connections.delete(id);
                triggers.delete(id);
            };
        }
    };
}
