export const scenario = new URLSearchParams(location.search).get('case');
export const generatedValues = scenario === 'generated-values';
export const dynamicMultiple = scenario === 'dynamic-multiple' || scenario === 'dynamic-multiple-toolbar';
export const dynamicItems = scenario === 'dynamic-items';
export const initialDefault =
    scenario === 'horizontal'
        ? ['underline']
        : scenario === 'default' || scenario === 'controlled' || dynamicMultiple
          ? ['bold']
          : undefined;
export const initialValue = scenario === 'controlled' ? [] : undefined;
export const multiple = scenario === 'multiple' || generatedValues;
export const orientation = scenario === 'vertical' ? 'vertical' : 'horizontal';
export const direction = scenario === 'rtl' ? 'rtl' : 'ltr';
export const loopFocus = scenario !== 'vertical';
export const toolbar = scenario === 'toolbar' || scenario === 'dynamic-multiple-toolbar';

export function authoredValue(value: string): string | undefined {
    if (!generatedValues) return value;
    return value === 'bold' ? undefined : '';
}

export function isCustomItem(value: string): boolean {
    return generatedValues ? value === 'bold' : value === 'italic' && (multiple || scenario === 'horizontal');
}

export function isDisabledItem(value: string, firstDisabled: boolean): boolean {
    if (generatedValues) return firstDisabled && value === 'bold';
    return value === 'italic' && (scenario === 'horizontal' || scenario === 'toolbar');
}

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
const generatedIds = new Map<string, string>();

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
    const recordedValue = value.map((id) => {
        if (!generatedValues) return id;
        const known = generatedIds.get(id);
        if (known !== undefined) return known;
        const label = `generated-${generatedIds.size + 1}`;
        generatedIds.set(id, label);
        return label;
    });
    window.toggleGroupParity.requests.push({
        part: 'group',
        value: recordedValue,
        reason: details.reason,
        eventType: details.event.type,
        sharedDetails: details === lastDetails
    });
    if (window.toggleGroupParity.cancel === 'group') details.cancel();
}
