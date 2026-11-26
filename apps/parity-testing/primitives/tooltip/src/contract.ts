type Reference = { commit: string; packageVersion: string; digest: string };

declare global {
    const __PARITY_REFERENCE__: Reference;
    interface Window {
        tooltipParity: Reference;
    }
}

export const hoverDelay = 300;
export const hoverCloseDelay = 180;
export const updatedHoverDelay = 500;
export const updatedHoverCloseDelay = 450;
export const triggerHoverDelay = 80;
export const triggerHoverCloseDelay = 100;
export const groupTimeout = 160;

export interface OpenRequest {
    open: boolean;
    reason: string;
    canceled: boolean;
}

export function installFixture(): { open?: boolean; defaultOpen: boolean; interactions: boolean; identity: boolean } {
    window.tooltipParity = __PARITY_REFERENCE__;
    const params = new URLSearchParams(window.location.search);
    return {
        open: params.has('open') ? params.get('open') === 'true' : undefined,
        defaultOpen: params.get('defaultOpen') === 'true',
        interactions: params.has('interactions'),
        identity: params.has('identity')
    };
}
