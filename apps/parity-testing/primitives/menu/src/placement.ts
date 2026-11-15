export const placementCases = [
    'placement-root',
    'placement-root-rtl',
    'placement-submenu',
    'placement-submenu-rtl',
    'placement-submenu-fallback',
    'placement-submenu-override',
    'placement-bar-horizontal',
    'placement-bar-vertical',
    'placement-bar-vertical-rtl',
    'placement-bar-switch',
    'placement-bar-switch-rtl',
    'placement-context',
    'placement-context-rtl',
    'placement-context-explicit-side',
    'placement-context-center',
    'placement-context-zero-offsets'
] as const;

export function placementConfig(name: string) {
    if (!(placementCases as readonly string[]).includes(name)) return undefined;
    return {
        kind: name.includes('-context')
            ? ('context' as const)
            : name.includes('-bar-')
              ? ('bar' as const)
              : ('menu' as const),
        nested: name.includes('-submenu'),
        vertical: name.includes('-vertical'),
        switchOrientation: name.includes('-switch'),
        fallback: name.endsWith('-fallback'),
        override: name.endsWith('-override'),
        side: name.endsWith('-explicit-side') ? ('bottom' as const) : undefined,
        align: name.endsWith('-center') ? ('center' as const) : undefined,
        offset: name.endsWith('-zero-offsets') ? 0 : undefined
    };
}
