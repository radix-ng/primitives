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
    'initial-disabled-submenu-retained'
] as const;
export function initialFocusConfig(name: string) {
    if (!(initialFocusCases as readonly string[]).includes(name)) return undefined;
    return {
        nested: name.includes('submenu'),
        retained: name.endsWith('retained'),
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
