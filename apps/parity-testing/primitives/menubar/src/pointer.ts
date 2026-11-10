export const pointerCases = [
    'nested-pointer-cancel-open',
    'nested-pointer-cancel-hover-close',
    'nested-pointer-cancel-child-select',
    'nested-pointer-cancel-parent-select'
] as const;

export function cancelPointerChange(name: string, layer: string, open: boolean, reason: string) {
    return (
        (layer === 'file-sub' &&
            ((name === 'nested-pointer-cancel-open' && open) ||
                (name === 'nested-pointer-cancel-hover-close' && !open && reason === 'sibling-open') ||
                (name === 'nested-pointer-cancel-child-select' && !open && reason === 'item-press'))) ||
        (layer === 'file' && name === 'nested-pointer-cancel-parent-select' && !open && reason === 'item-press')
    );
}
