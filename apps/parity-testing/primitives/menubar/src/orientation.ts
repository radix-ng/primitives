import { menuClasses } from '../../../shared/menu-fixture';

export const orientationCases = [
    'orientation-horizontal',
    'orientation-horizontal-rtl',
    'orientation-horizontal-vertical-bar',
    'orientation-horizontal-vertical-bar-rtl',
    'orientation-nested',
    'orientation-nested-rtl',
    'orientation-nested-vertical-bar',
    'orientation-nested-vertical-bar-rtl',
    'orientation-child-horizontal',
    'orientation-child-horizontal-rtl',
    'orientation-child-horizontal-vertical-bar',
    'orientation-child-horizontal-vertical-bar-rtl',
    'orientation-both-horizontal',
    'orientation-both-horizontal-rtl',
    'orientation-both-horizontal-vertical-bar',
    'orientation-both-horizontal-vertical-bar-rtl'
] as const;

export function orientationConfig(name: string) {
    return {
        orientationCase: name.startsWith('orientation-'),
        popupOrientation:
            name.startsWith('orientation-') && !name.startsWith('orientation-child-')
                ? ('horizontal' as const)
                : ('vertical' as const),
        childOrientation:
            name.startsWith('orientation-child-') || name.startsWith('orientation-both-')
                ? ('horizontal' as const)
                : ('vertical' as const)
    };
}

export function menubarClasses(settings: ReturnType<typeof orientationConfig>) {
    const horizontal = ' flex! w-max!';
    return {
        ...menuClasses,
        popup: menuClasses.popup + (settings.popupOrientation === 'horizontal' ? horizontal : ''),
        childPopup: menuClasses.popup + (settings.childOrientation === 'horizontal' ? horizontal : '')
    };
}
