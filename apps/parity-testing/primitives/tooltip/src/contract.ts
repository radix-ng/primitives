type Reference = { commit: string; packageVersion: string; digest: string };

declare global {
    const __PARITY_REFERENCE__: Reference;
    interface Window {
        tooltipParity: Reference;
    }
}

export const hoverDelay = 300;

export interface OpenRequest {
    open: boolean;
    reason: string;
    canceled: boolean;
}

export function installFixture(): { open?: boolean; defaultOpen: boolean } {
    window.tooltipParity = __PARITY_REFERENCE__;
    const params = new URLSearchParams(window.location.search);
    return {
        open: params.has('open') ? params.get('open') === 'true' : undefined,
        defaultOpen: params.get('defaultOpen') === 'true'
    };
}
