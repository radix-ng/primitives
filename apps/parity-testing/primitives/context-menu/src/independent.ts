export const independentCases = [
    'roots-areas-open',
    'roots-areas-outer-disabled',
    'roots-areas-inner-disabled',
    'roots-areas-cancel-open',
    'roots-areas-cancel-close',
    'roots-areas-remount',
    'roots-areas-retained',
    'roots-areas-switch',
    'roots-popup-escape',
    'roots-popup-select',
    'roots-popup-cancel-open',
    'roots-popup-cancel-close',
    'roots-popup-outside',
    'roots-popup-owner-close',
    'roots-popup-submenu',
    'roots-popup-retained'
] as const;

export function independentConfig(name: string) {
    if (!(independentCases as readonly string[]).includes(name)) return undefined;
    return {
        popup: name.startsWith('roots-popup-'),
        outerDisabled: name === 'roots-areas-outer-disabled',
        innerDisabled: name === 'roots-areas-inner-disabled',
        retained: name.endsWith('-retained'),
        submenu: name.endsWith('-submenu')
    };
}

export function cancelIndependent(name: string, owner: string, open: boolean, allow: boolean) {
    return (
        !allow &&
        owner === 'inner' &&
        ((name.endsWith('-cancel-open') && open) || (name.endsWith('-cancel-close') && !open))
    );
}
