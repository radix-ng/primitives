export const itemDialogCases = [
    'item-dialog-keyboard',
    'item-dialog-space',
    'item-dialog-pointer',
    'item-dialog-retained',
    'item-dialog-composed',
    'item-dialog-composed-retained',
    'item-dialog-deferred',
    'item-dialog-css',
    'item-dialog-cancel-close',
    'item-dialog-submenu',
    'item-dialog-drag',
    'item-dialog-drag-retained',
    'item-dialog-drag-css',
    'item-dialog-stay-open',
    'item-dialog-stay-tab',
    'item-dialog-stay-hover',
    'item-dialog-stay-retained',
    'item-dialog-stay-cancel-open'
] as const;

export function itemDialogConfig(name: string) {
    if (!itemDialogCases.includes(name as (typeof itemDialogCases)[number])) return undefined;
    return {
        stayOpen: name.includes('-stay-'),
        composed: name.includes('-composed'),
        retained: name.includes('retained'),
        animated: name.endsWith('-css'),
        deferred: name.endsWith('-deferred'),
        canceledClose: name === 'item-dialog-cancel-close',
        canceledOpen: name === 'item-dialog-stay-cancel-open',
        nested: name === 'item-dialog-submenu',
        drag: name.includes('-drag')
    };
}
