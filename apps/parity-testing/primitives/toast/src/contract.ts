export interface ToastEvent {
    id: string;
    phase: 'close' | 'remove';
}

type Reference = { commit: string; packageVersion: string; digest: string };

declare global {
    const __PARITY_REFERENCE__: Reference;
    interface Window {
        toastParity: { reference: Reference; events: ToastEvent[] };
    }
}

export const providerTimeout = 1000;
export const resetTimeout = 500;

export function installFixture(): void {
    window.toastParity = { reference: __PARITY_REFERENCE__, events: [] };
}

export function notification(id: string, title: string, timeout?: number) {
    return {
        id,
        title,
        timeout,
        onClose: () => window.toastParity.events.push({ id, phase: 'close' }),
        onRemove: () => window.toastParity.events.push({ id, phase: 'remove' })
    };
}

export function saveNotification(persistent: boolean) {
    return {
        loading: notification('save', 'Saving'),
        success: { title: 'Saved', timeout: persistent ? 0 : undefined },
        error: 'Save failed'
    };
}
