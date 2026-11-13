export const popoverMenuCases = [
    'popover-menu-escape',
    'popover-menu-modal',
    'popover-menu-trap-focus',
    'popover-menu-outside',
    'popover-menu-outside-nonmodal',
    'popover-menu-outside-all',
    'popover-menu-outside-all-modal',
    'popover-menu-outside-all-nonmodal',
    'popover-menu-outside-all-deferred',
    'popover-menu-outside-all-retained',
    'popover-menu-select',
    'popover-menu-tab',
    'popover-menu-shift-tab',
    'popover-menu-submenu',
    'popover-menu-cancel',
    'popover-menu-retained',
    'popover-menu-deferred',
    'popover-menu-remove',
    'popover-menu-remove-retained',
    'popover-menu-remove-submenu',
    'popover-menu-remove-exit',
    'popover-menu-remove-deferred',
    'popover-menu-close-parent',
    'popover-menu-close-parent-retained'
] as const;

export function popoverMenuConfig(name: string) {
    if (!popoverMenuCases.includes(name as (typeof popoverMenuCases)[number])) return undefined;
    const outsideAll = name.startsWith('popover-menu-outside-all');
    const nonmodalMenu = outsideAll || name.endsWith('-nonmodal');
    return {
        nested: name.includes('submenu'),
        retained: name.includes('retained'),
        deferred: name.includes('deferred'),
        animated: name.endsWith('-exit'),
        canceled: name === 'popover-menu-cancel',
        menuModal: !nonmodalMenu,
        parentModal:
            name === 'popover-menu-trap-focus'
                ? ('trap-focus' as const)
                : ['popover-menu-modal', 'popover-menu-outside-all-modal'].includes(name)
    };
}

export const popoverHostClass =
    'border-border bg-popover text-popover-foreground grid w-[400px] gap-3 rounded border p-4 shadow-md outline-none';
