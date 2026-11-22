export const scenario = new URLSearchParams(location.search).get('case');
export const initialDefault = scenario === 'default' || scenario === 'controlled';
export const initialPressed = scenario === 'controlled' ? false : undefined;

export interface PressRequest {
    pressed: boolean;
    reason: string;
    eventType: string;
}

interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    requests: PressRequest[];
    cancel: boolean;
}

declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        toggleParity: Probe;
    }
}

export function installProbe(): void {
    window.toggleParity = { reference: __PARITY_REFERENCE__, requests: [], cancel: false };
}

export function record(pressed: boolean, details: { reason: string; event: Event; cancel(): void }): void {
    const probe = window.toggleParity;
    probe.requests.push({ pressed, reason: details.reason, eventType: details.event.type });
    if (probe.cancel) details.cancel();
}
