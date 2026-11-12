export const touchCases = [
    'touch-open-select',
    'touch-toggle',
    'touch-disabled-trigger',
    'touch-disabled-item',
    'touch-stay-open',
    'touch-checkbox',
    'touch-radio',
    'touch-cancel-open',
    'touch-cancel-close',
    'touch-outside-modal',
    'touch-outside-nonmodal',
    'touch-submenu',
    'touch-submenu-toggle',
    'touch-submenu-rtl',
    'touch-retained',
    'touch-trigger-cancel',
    'touch-item-cancel',
    'touch-trigger-pan',
    'touch-popup-pan',
    'touch-outside-pan',
    'touch-submenu-cancel',
    'touch-small-scroll-policy',
    'touch-wide-scroll-policy',
    'touch-disabled-checkbox',
    'touch-disabled-radio'
] as const;

export function touchConfig(name: string) {
    if (!(touchCases as readonly string[]).includes(name)) return undefined;
    return {
        gesture: /-(?:cancel|pan)$/.test(name) && !name.startsWith('touch-cancel-'),
        pageScroll: name === 'touch-trigger-pan' || name === 'touch-outside-pan' || name.endsWith('-scroll-policy'),
        wide: name === 'touch-wide-scroll-policy',
        popupScroll: name === 'touch-popup-pan',
        submenu: name.startsWith('touch-submenu'),
        retained: name === 'touch-retained'
    };
}

export const touchScrollEntries = Array.from({ length: 30 }, (_, index) => ({
    id: `scroll-${index}`,
    label: `Action ${index + 1}`,
    disabled: false
}));
