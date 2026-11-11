export const compositionCases = [
    'composition-keyboard',
    'composition-keyboard-rtl',
    'composition-hover',
    'composition-hover-rtl',
    'composition-cancel-child-open',
    'composition-cancel-child-close',
    'composition-cancel-parent-select',
    'areas-reopen',
    'areas-switch',
    'areas-switch-cancel-close',
    'areas-cancel-open',
    'areas-cancel-close',
    'areas-nested',
    'areas-nested-cancel-open',
    'areas-return-focus',
    'areas-keep-mounted'
] as const;

export function cancelComposition(name: string, layer: string, open: boolean, reason: string) {
    return (
        (layer === 'context-sub' &&
            ((name === 'composition-cancel-child-open' && open) ||
                (name === 'composition-cancel-child-close' && !open))) ||
        (layer === 'context' &&
            ((['areas-cancel-open', 'areas-nested-cancel-open'].includes(name) && open) ||
                (['areas-cancel-close', 'areas-switch-cancel-close'].includes(name) && !open) ||
                (name === 'composition-cancel-parent-select' && !open && reason === 'item-press')))
    );
}
