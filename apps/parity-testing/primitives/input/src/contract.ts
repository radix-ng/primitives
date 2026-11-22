export type Request = {
    value: string;
    reason: string;
    event: string;
    inputType: string | null;
    composing: boolean;
    trusted: boolean;
};

interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    requests: Request[];
    events: string[];
    submissions: Record<string, string>[];
    cancelEdit: boolean;
    cancelBeforeInput: boolean;
    cancelReset: boolean;
}

declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        inputParity: Probe;
    }
}

export const scenario = new URLSearchParams(location.search).get('case');
export const initialValue = scenario === 'controlled' ? '' : undefined;
export const required = scenario === 'field';
export const locked = scenario === 'locked';
export const initialDefault = required
    ? 'seed@example.com'
    : ['default', 'controlled', 'canceled', 'reset'].includes(scenario ?? '')
      ? 'seed'
      : undefined;

export function installProbe(): void {
    const probe: Probe = {
        reference: __PARITY_REFERENCE__,
        requests: [],
        events: [],
        submissions: [],
        cancelEdit: false,
        cancelBeforeInput: false,
        cancelReset: false
    };
    window.inputParity = probe;
    for (const type of ['beforeinput', 'input', 'change', 'compositionstart', 'compositionend', 'invalid']) {
        document.addEventListener(
            type,
            (event) => {
                if (!(event.target instanceof HTMLInputElement) || !event.target.hasAttribute('data-test-input'))
                    return;
                probe.events.push(type);
                if (type === 'beforeinput' && probe.cancelBeforeInput) event.preventDefault();
            },
            true
        );
    }
    document.addEventListener('reset', (event) => {
        if (probe.cancelReset) event.preventDefault();
    });
    document.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        probe.submissions.push(Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, String(value)])));
    });
}

export function record(value: string, details: { reason: string; event: Event; cancel(): void }): void {
    const probe = window.inputParity;
    const event = details.event;
    probe.requests.push({
        value,
        reason: details.reason,
        event: event.type,
        inputType: event instanceof InputEvent ? event.inputType : null,
        composing: event instanceof InputEvent && event.isComposing,
        trusted: event.isTrusted
    });
    if (probe.cancelEdit) details.cancel();
}
