export const scenario = new URLSearchParams(location.search).get('case');
export const initialDefault = scenario === 'default' || scenario === 'controlled' ? ['bold'] : undefined;
export const initialValue = scenario === 'controlled' ? [] : undefined;

export type Request =
    | { part: 'item'; item: string; pressed: boolean; reason: string; eventType: string }
    | { part: 'group'; value: string[]; reason: string; eventType: string; sharedDetails: boolean };

interface Details {
    reason: string;
    event: Event;
    cancel(): void;
}

interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    requests: Request[];
}

declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        toggleGroupParity: Probe;
    }
}

export function installProbe(): void {
    window.toggleGroupParity = { reference: __PARITY_REFERENCE__, requests: [] };
}

let lastDetails: Details | undefined;

export function recordItem(item: string, pressed: boolean, details: Details): void {
    lastDetails = details;
    window.toggleGroupParity.requests.push({
        part: 'item',
        item,
        pressed,
        reason: details.reason,
        eventType: details.event.type
    });
}

export function recordGroup(value: readonly string[], details: Details): void {
    window.toggleGroupParity.requests.push({
        part: 'group',
        value: [...value],
        reason: details.reason,
        eventType: details.event.type,
        sharedDetails: details === lastDetails
    });
}
