import { cancelPointerChange } from './pointer';

export const compositionCases = [
    'cancel-switch-open-keyboard',
    'cancel-switch-open-pointer',
    'cancel-switch-close-keyboard',
    'cancel-switch-close-pointer',
    'vertical-roving',
    'vertical-open',
    'vertical-open-rtl',
    'vertical-popup',
    'vertical-close-arrow',
    'vertical-close-arrow-rtl',
    'nested-keyboard',
    'nested-keyboard-rtl',
    'nested-switch',
    'nested-forward',
    'nested-composed',
    'nested-cancel-open',
    'nested-cancel-close-escape',
    'nested-cancel-close-arrow',
    'nested-cancel-close-arrow-composed',
    'roving-rtl'
] as const;

/** Application cancellation policy, shared by uncontrolled and explicitly controlled cases. */
export function cancelChange(name: string, layer: string, open: boolean, reason: string, allowSwitch: boolean) {
    return (
        (open && name === 'cancel-open') ||
        (!open && name === 'cancel-close') ||
        (!allowSwitch &&
            ((name === 'retained-cancel-close' && layer === 'file' && !open) ||
                cancelPointerChange(name, layer, open, reason))) ||
        (!allowSwitch &&
            layer === 'file' &&
            ((name === 'state-controlled-cancel-open' && open) ||
                (name === 'state-controlled-cancel-close' && !open))) ||
        (!allowSwitch &&
            ((name.startsWith('cancel-switch-open') && layer === 'edit' && open) ||
                (name.startsWith('cancel-switch-close') && layer === 'file' && !open && reason === 'sibling-open') ||
                (layer === 'file-sub' &&
                    ((name === 'nested-cancel-open' && open) || (name.startsWith('nested-cancel-close') && !open)))))
    );
}
