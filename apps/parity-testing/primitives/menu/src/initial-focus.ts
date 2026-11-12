export const initialFocusCases = [
    'initial-disabled-enter',
    'initial-disabled-space',
    'initial-disabled-down',
    'initial-disabled-up',
    'initial-disabled-div-enter',
    'initial-disabled-link-enter',
    'initial-disabled-pointer',
    'initial-disabled-retained',
    'initial-disabled-all-enter',
    'initial-disabled-all-up',
    'initial-disabled-single-enter',
    'initial-disabled-submenu',
    'initial-disabled-submenu-retained',
    'initial-disabled-submenu-tab',
    'initial-disabled-submenu-shift-tab',
    'initial-disabled-submenu-retained-tab',
    'initial-disabled-submenu-retained-shift-tab',
    'initial-disabled-submenu-control-tab',
    'initial-disabled-submenu-retained-control-tab'
] as const;
export function initialFocusConfig(name: string) {
    if (!(initialFocusCases as readonly string[]).includes(name)) return undefined;
    return {
        nested: name.includes('submenu'),
        retained: name.includes('-retained'),
        departure: name.endsWith('-shift-tab') ? 'Shift+Tab' : name.endsWith('-tab') ? 'Tab' : undefined,
        parentControl: name.includes('-control-'),
        allDisabled: name.includes('-all-'),
        single: name.includes('-single-'),
        key: name.endsWith('space')
            ? 'Space'
            : name.endsWith('down')
              ? 'ArrowDown'
              : name.endsWith('up')
                ? 'ArrowUp'
                : name.endsWith('pointer')
                  ? 'mouse'
                  : 'Enter'
    };
}
