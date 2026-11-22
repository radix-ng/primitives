export const scenario = new URLSearchParams(location.search).get('case');
export const initialDefault =
    scenario === 'horizontal'
        ? ['underline']
        : scenario === 'default' || scenario === 'controlled'
          ? ['bold']
          : undefined;
export const initialValue = scenario === 'controlled' ? [] : undefined;
export const multiple = scenario === 'multiple';
export const orientation = scenario === 'vertical' ? 'vertical' : 'horizontal';
export const direction = scenario === 'rtl' ? 'rtl' : 'ltr';
export const loopFocus = scenario !== 'vertical';
export const toolbar = scenario === 'toolbar';
export const disabledItem = scenario === 'horizontal' || toolbar;
export const customItem = multiple || scenario === 'horizontal';

export const items = [
    { value: 'bold', label: 'Bold' },
    { value: 'italic', label: 'Italic' },
    { value: 'underline', label: 'Underline' }
];

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
    cancel?: 'item' | 'group';
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
    if (window.toggleGroupParity.cancel === 'item') details.cancel();
}

export function recordGroup(value: readonly string[], details: Details): void {
    window.toggleGroupParity.requests.push({
        part: 'group',
        value: [...value],
        reason: details.reason,
        eventType: details.event.type,
        sharedDetails: details === lastDetails
    });
    if (window.toggleGroupParity.cancel === 'group') details.cancel();
}
