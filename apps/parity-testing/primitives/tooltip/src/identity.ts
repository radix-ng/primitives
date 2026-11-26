import type { OpenRequest } from './contract';

export const copyId = 'copy-format';
export const pasteId = 'paste-format';

export interface IdentityRequest extends OpenRequest {
    trigger: string | null;
}

export function identityInitialState(): {
    open?: boolean;
    triggerId: string | null;
    defaultOpen: boolean;
    defaultTriggerId: string | null;
    showPaste: boolean;
    viewport: boolean;
} {
    const scenario = new URLSearchParams(window.location.search).get('identity');
    return {
        open:
            scenario === 'identity-controlled' ||
            scenario === 'identity-late-trigger' ||
            scenario === 'identity-implicit'
                ? true
                : undefined,
        triggerId: scenario === 'identity-controlled' ? copyId : scenario === 'identity-late-trigger' ? pasteId : null,
        defaultOpen: scenario === 'identity-default',
        defaultTriggerId: scenario === 'identity-controlled' || scenario === 'identity-default' ? pasteId : null,
        showPaste: scenario !== 'identity-late-trigger',
        viewport: scenario === 'identity-viewport'
    };
}
