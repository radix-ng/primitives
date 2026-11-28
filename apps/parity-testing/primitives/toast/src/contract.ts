export interface ToastEvent {
    id: string;
    phase: 'close' | 'remove';
    owner?: RequestOwner;
}

export const requestOwners = ['first', 'second'] as const;
type RequestOwner = (typeof requestOwners)[number];
export const requestId = 'request';
export interface RequestSettlement {
    owner: RequestOwner;
    outcome: 'fulfilled' | 'rejected';
}

type Reference = { commit: string; packageVersion: string; digest: string };

declare global {
    const __PARITY_REFERENCE__: Reference;
    interface Window {
        toastParity: { reference: Reference; events: ToastEvent[]; settlements: RequestSettlement[] };
    }
}

export const providerTimeout = 1000;
export const resetTimeout = 500;

export function installFixture(): void {
    window.toastParity = { reference: __PARITY_REFERENCE__, events: [], settlements: [] };
}

export function notification(id: string, title: string, timeout?: number, owner?: RequestOwner) {
    const event = owner ? { id, owner } : { id };
    return {
        id,
        title,
        timeout,
        onClose: () => window.toastParity.events.push({ ...event, phase: 'close' }),
        onRemove: () => window.toastParity.events.push({ ...event, phase: 'remove' })
    };
}

type RequestCopy = {
    loading: ReturnType<typeof notification>;
    success: { title: string; timeout: number };
    error: { title: string; timeout: number };
};

export function createRequests(show: (request: Promise<void>, options: RequestCopy) => Promise<void>) {
    const pending = new Map<RequestOwner, { resolve: () => void; reject: (error: Error) => void }>();
    return {
        start(owner: RequestOwner) {
            const request = new Promise<void>((resolve, reject) => pending.set(owner, { resolve, reject }));
            void show(request, {
                loading: notification(requestId, `Saving ${owner}`, 0, owner),
                success: { title: `Saved ${owner}`, timeout: 0 },
                error: { title: `Failed ${owner}`, timeout: 0 }
            }).then(
                () => window.toastParity.settlements.push({ owner, outcome: 'fulfilled' }),
                () => window.toastParity.settlements.push({ owner, outcome: 'rejected' })
            );
        },
        resolve(owner: RequestOwner) {
            pending.get(owner)?.resolve();
            pending.delete(owner);
        },
        reject(owner: RequestOwner) {
            pending.get(owner)?.reject(new Error(`Request ${owner} failed`));
            pending.delete(owner);
        }
    };
}

export function saveNotification(persistent: boolean) {
    return {
        loading: notification('save', 'Saving'),
        success: { title: 'Saved', timeout: persistent ? 0 : undefined },
        error: 'Save failed'
    };
}
