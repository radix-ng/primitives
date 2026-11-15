export const positioningCases = [
    'position-method-default-scroll',
    'position-method-fixed-scroll',
    'position-method-switch-scroll',
    'position-sticky-off-vertical',
    'position-sticky-on-vertical',
    'position-sticky-off-horizontal',
    'position-sticky-on-horizontal',
    'position-sticky-arrow-horizontal',
    'position-sticky-arrow-scaled',
    'position-sticky-toggle'
] as const;

export function positioningConfig(name: string) {
    if (!(positioningCases as readonly string[]).includes(name)) return undefined;
    return {
        documentScroll: name.startsWith('position-method-'),
        method: name.includes('-fixed-') ? ('fixed' as const) : undefined,
        switchMethod: name.includes('-switch-'),
        stickyTest: name.startsWith('position-sticky-'),
        sticky: name.includes('-on-'),
        toggleSticky: name.endsWith('-toggle'),
        horizontal: name.endsWith('-horizontal') || name.includes('-arrow-'),
        arrow: name.includes('-arrow-'),
        scaledPopup: name.endsWith('-scaled')
    };
}
