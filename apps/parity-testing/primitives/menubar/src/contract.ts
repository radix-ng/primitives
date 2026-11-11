import { collectionCases, type MenuEntry } from '../../../shared/menu-collection';
import { createMenuProbe, type MenuProbe } from '../../../shared/menu-probe';
import { rootRemovalCases, rootRemovalConfig } from '../../../shared/root-removal';
import { compositionCases } from './composition';
import { orientationCases, orientationConfig } from './orientation';
import { pointerCases } from './pointer';
import { retainedCases } from './retained';
import { stateCases } from './state';
export const cases = [
    'open-keyboard',
    'open-pointer',
    'roving',
    'switch-keyboard',
    'switch-backward',
    'switch-backward-rtl',
    'single-menu-switch',
    'single-menu-switch-rtl',
    'switch-pointer',
    'rtl-switch',
    'disabled',
    'select',
    'cancel-open',
    'cancel-close',
    'outside',
    'tab',
    ...collectionCases,
    'collection-disable-focused',
    'collection-disable-open',
    ...compositionCases,
    ...stateCases,
    ...retainedCases,
    ...pointerCases,
    ...orientationCases,
    ...rootRemovalCases
] as const;
export function config() {
    const name = new URLSearchParams(location.search).get('case') ?? 'open-keyboard';
    if (!cases.includes(name as (typeof cases)[number])) throw new Error(`Unknown Menubar case: ${name}`);
    const removal = rootRemovalConfig(name);
    return {
        name,
        removal,
        dir: name === 'rtl-switch' || name.endsWith('-rtl') ? ('rtl' as const) : ('ltr' as const),
        disabled: name === 'disabled',
        keepMounted: name.startsWith('retained-') || name.endsWith('-retained') || !!removal?.retained,
        ...orientationConfig(name),
        side:
            name.startsWith('orientation-') && name.includes('-vertical-bar')
                ? name.endsWith('-rtl')
                    ? ('left' as const)
                    : ('right' as const)
                : ('bottom' as const),
        orientation:
            name.startsWith('vertical-') || name.endsWith('-vertical') || name.includes('-vertical-bar')
                ? ('vertical' as const)
                : ('horizontal' as const),
        defaultOpen: name.startsWith('state-default-open'),
        controlled: name.startsWith('state-controlled-'),
        nested:
            removal?.nested ||
            name.startsWith('nested-') ||
            name.startsWith('retained-nested-') ||
            (name.startsWith('orientation-') && !name.startsWith('orientation-horizontal')),
        composed: name.endsWith('-composed')
    };
}
export type TopLayer = 'file' | 'blocked' | 'edit' | 'new';
export type Layer = TopLayer | `${TopLayer}-sub`;
export function submenuId(menu: TopLayer): `${TopLayer}-sub` {
    return `${menu}-sub`;
}
export const menubarEntries: MenuEntry<TopLayer>[] = [
    { id: 'file', label: 'file', disabled: false },
    { id: 'blocked', label: 'blocked', disabled: true },
    { id: 'edit', label: 'edit', disabled: false }
];
export function initialMenus(name: string): MenuEntry<TopLayer>[] {
    if (name.startsWith('single-menu-switch')) return menubarEntries.slice(0, 1);
    if (name === 'roving-rtl') return [...menubarEntries, { id: 'new', label: 'new', disabled: false }];
    return menubarEntries;
}
export type Probe = MenuProbe<ReturnType<typeof config>, Layer>;
declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        menubarParity: Probe;
    }
}
export function installProbe(framework: string) {
    const trace = createMenuProbe(framework, __PARITY_REFERENCE__, config(), [
        'file',
        'blocked',
        'edit',
        'new',
        'file-sub',
        'blocked-sub',
        'edit-sub',
        'new-sub'
    ] as const);
    document.documentElement.dir = trace.probe.config.dir;
    window.menubarParity = trace.probe;
    return trace;
}
