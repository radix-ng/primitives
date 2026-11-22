export const scenario = new URLSearchParams(location.search).get('case');
export const initialDefault = scenario === 'default' || scenario === 'controlled';
export const initialPressed = scenario === 'controlled' ? false : undefined;
export const disabled = scenario === 'custom-disabled';
export const custom = scenario === 'custom-activation' || disabled;

export interface PressRequest {
    pressed: boolean;
    reason: string;
    eventType: string;
    originalClick: boolean;
    shiftKey: boolean;
    trusted: boolean;
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
    document.addEventListener(
        'click',
        (event) => {
            lastClick = event;
        },
        true
    );
}

let lastClick: MouseEvent | undefined;

export function record(pressed: boolean, details: { reason: string; event: Event; cancel(): void }): void {
    const probe = window.toggleParity;
    probe.requests.push({
        pressed,
        reason: details.reason,
        eventType: details.event.type,
        originalClick: details.event === lastClick,
        shiftKey: details.event instanceof MouseEvent && details.event.shiftKey,
        trusted: details.event.isTrusted
    });
    if (probe.cancel) details.cancel();
}
