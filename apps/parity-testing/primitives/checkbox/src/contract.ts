export interface Change {
    part: string;
    value: boolean | string[];
    reason: string;
    eventType: string;
}

interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    changes: Change[];
    native: string[];
    cancelPart: string | null;
    cancelEnter: boolean;
}

declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        checkboxParity: Probe;
    }
}

export const scenario = new URLSearchParams(location.search).get('case') ?? '';
export const group = scenario.startsWith('group-');
export const initialChecked = scenario === 'controlled' ? false : undefined;
export const initialDefault = scenario === 'default' || scenario === 'controlled' ? true : undefined;
export const mixed = scenario === 'mixed';
export const keepMounted = scenario === 'indicator';
export const initialGroup: string[] | undefined = scenario === 'group-controlled' ? [] : undefined;
export const groupDefault = ['b'];
export const values = ['a', 'b'];

export function installProbe(): Probe {
    const probe: Probe = {
        reference: __PARITY_REFERENCE__,
        changes: [],
        native: [],
        cancelPart: null,
        cancelEnter: false
    };
    window.checkboxParity = probe;
    for (const type of ['input', 'change']) {
        document.addEventListener(type, (event) => {
            if (event.target instanceof HTMLInputElement && event.target.name === 'terms') {
                probe.native.push(type);
            }
        });
    }
    document.addEventListener('submit', (event) => {
        probe.native.push('submit:' + (event.submitter?.id ?? ''));
        event.preventDefault();
    });
    return probe;
}

let lastCheckedDetails: unknown;

export function record(
    part: string,
    value: Change['value'],
    details: { reason: string; event: Event; cancel(): void }
): boolean {
    const probe = window.checkboxParity;
    if (part === 'group') {
        if (lastCheckedDetails !== details)
            throw new Error('Checkbox and CheckboxGroup received different event details');
    } else {
        lastCheckedDetails = details;
    }
    probe.changes.push({ part, value, reason: details.reason, eventType: details.event.type });
    if (probe.cancelPart !== part) return true;
    probe.cancelPart = null;
    details.cancel();
    return false;
}
