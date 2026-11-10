export const pointerCases = [
    'hover-root',
    'hover-root-cancel',
    'hover-root-reenter',
    'hover-root-click',
    'hover-root-press-before-delay',
    'hover-root-disabled',
    'hover-submenu',
    'hover-submenu-rtl',
    'hover-submenu-cancel',
    'hover-submenu-sibling',
    'hover-submenu-click',
    'hover-submenu-disabled',
    'drag-select',
    'drag-too-soon',
    'drag-outside',
    'drag-disabled',
    'drag-stay',
    'drag-checkbox',
    'drag-radio'
] as const;

export function pointerConfig(name: string) {
    return {
        rootHover: name.startsWith('hover-root'),
        submenuHover: name.startsWith('hover-submenu'),
        delay: name.startsWith('hover-') ? 180 : undefined,
        closeDelay: name.startsWith('hover-') ? 80 : undefined,
        disabledSubmenu: name === 'hover-submenu-disabled'
    };
}
