import { collectionCases, type MenuEntry } from '../../../shared/menu-collection';
import { createMenuProbe, type MenuProbe } from '../../../shared/menu-probe';
import { compositionCases } from './composition';
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
    ...pointerCases
] as const;
export function config() {
    const name = new URLSearchParams(location.search).get('case') ?? 'open-keyboard';
    if (!cases.includes(name as (typeof cases)[number])) throw new Error(`Unknown Menubar case: ${name}`);
    return {
        name,
        dir: name === 'rtl-switch' || name.endsWith('-rtl') ? ('rtl' as const) : ('ltr' as const),
        disabled: name === 'disabled',
        keepMounted: name.startsWith('retained-') || name.endsWith('-retained'),
        side: 'bottom' as const,
        orientation:
            name.startsWith('vertical-') || name.endsWith('-vertical')
                ? ('vertical' as const)
                : ('horizontal' as const),
        defaultOpen: name.startsWith('state-default-open'),
        controlled: name.startsWith('state-controlled-'),
        nested: name.startsWith('nested-') || name.startsWith('retained-nested-'),
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
