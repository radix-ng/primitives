export const compositionCases = [
    'cancel-switch-open-keyboard',
    'cancel-switch-open-pointer',
    'cancel-switch-close-keyboard',
    'cancel-switch-close-pointer',
    'vertical-roving',
    'vertical-open',
    'vertical-open-rtl',
    'vertical-popup',
    'nested-keyboard',
    'nested-keyboard-rtl',
    'nested-switch',
    'nested-forward',
    'nested-composed',
    'roving-rtl'
] as const;

/** Application cancellation policy, shared without changing the primitive's uncontrolled state. */
export function cancelChange(name: string, layer: string, open: boolean, reason: string, allowSwitch: boolean) {
    return (
        (open && name === 'cancel-open') ||
        (!open && name === 'cancel-close') ||
        (!allowSwitch &&
            ((name.startsWith('cancel-switch-open') && layer === 'edit' && open) ||
                (name.startsWith('cancel-switch-close') && layer === 'file' && !open && reason === 'sibling-open')))
    );
}
