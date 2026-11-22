export interface Change {
    checked: boolean;
    reason: string;
    eventType: string;
    shiftKey: boolean;
}

interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    changes: Change[];
    native: string[];
    invalid: number;
    cancelsChange: boolean;
    cancelsReset: boolean;
}

declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        switchParity: Probe;
    }
}

export const scenario = new URLSearchParams(location.search).get('case');
export const isControlled = scenario === 'controlled';
export const initialDefault = ['default', 'controlled', 'reset'].includes(scenario ?? '') ? true : undefined;
export const required = scenario === 'external-form';
export const formId = required ? 'preferences' : undefined;

export function installProbe(): Probe {
    const probe: Probe = {
        reference: __PARITY_REFERENCE__,
        changes: [],
        native: [],
        invalid: 0,
        cancelsChange: false,
        cancelsReset: false
    };
    window.switchParity = probe;
    for (const type of ['input', 'change', 'invalid']) {
        document.addEventListener(
            type,
            (event) => {
                if (!(event.target instanceof HTMLInputElement) || event.target.name !== 'alerts') return;
                if (type === 'invalid') probe.invalid++;
                else probe.native.push(type);
            },
            true
        );
    }
    document.addEventListener('submit', (event) => {
        probe.native.push('submit:' + (event.submitter?.id ?? ''));
        event.preventDefault();
    });
    document.addEventListener('reset', (event) => {
        if (probe.cancelsReset) event.preventDefault();
    });
    return probe;
}

export function record(checked: boolean, details: { reason: string; event: Event; cancel(): void }): void {
    const probe = window.switchParity;
    probe.changes.push({
        checked,
        reason: details.reason,
        eventType: details.event.type,
        shiftKey: details.event instanceof MouseEvent && details.event.shiftKey
    });
    if (probe.cancelsChange) details.cancel();
}
