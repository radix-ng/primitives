export const itemPopoverCases = [
    'item-popover-keyboard',
    'item-popover-space',
    'item-popover-pointer',
    'item-popover-retained',
    'item-popover-composed',
    'item-popover-composed-retained',
    'item-popover-deferred',
    'item-popover-css',
    'item-popover-cancel-close',
    'item-popover-submenu',
    'item-popover-drag',
    'item-popover-drag-retained',
    'item-popover-drag-css',
    'item-popover-stay-open',
    'item-popover-stay-tab',
    'item-popover-stay-hover',
    'item-popover-stay-hover-retained',
    'item-popover-stay-retained',
    'item-popover-stay-cancel-open',
    'item-popover-outside',
    'item-popover-stay-modal',
    'item-popover-stay-trap-focus',
    'item-popover-stay-outside'
] as const;

export function itemPopoverConfig(name: string) {
    if (!itemPopoverCases.includes(name as (typeof itemPopoverCases)[number])) return undefined;
    return {
        stayOpen: name.includes('-stay-') || name.includes('-composed'),
        composed: name.includes('-composed'),
        retained: name.includes('retained'),
        animated: name.endsWith('-css'),
        deferred: name.endsWith('-deferred'),
        canceledClose: name === 'item-popover-cancel-close',
        canceledOpen: name === 'item-popover-stay-cancel-open',
        nested: name === 'item-popover-submenu',
        drag: name.includes('-drag'),
        modal:
            name.endsWith('-trap-focus') || name === 'item-popover-stay-tab'
                ? ('trap-focus' as const)
                : name.endsWith('-modal')
    };
}

export const itemPopoverClass =
    'border-border bg-popover text-popover-foreground grid w-[360px] gap-3 rounded border p-4 shadow-md outline-none';
