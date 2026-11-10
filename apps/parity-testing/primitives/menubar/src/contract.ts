import { collectionCases, type MenuEntry } from '../../../shared/menu-collection';
import { createMenuProbe, type MenuProbe } from '../../../shared/menu-probe';
import { compositionCases } from './composition';
export const cases = [
    'open-keyboard',
    'open-pointer',
    'roving',
    'switch-keyboard',
    'switch-backward',
    'switch-backward-rtl',
    'single-menu-switch',
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
    ...compositionCases
] as const;
export function config() {
    const name = new URLSearchParams(location.search).get('case') ?? 'open-keyboard';
    if (!cases.includes(name as (typeof cases)[number])) throw new Error(`Unknown Menubar case: ${name}`);
    return {
        name,
        dir: name === 'rtl-switch' || name.endsWith('-rtl') ? ('rtl' as const) : ('ltr' as const),
        disabled: name === 'disabled',
        keepMounted: false,
        side: 'bottom' as const,
        orientation: name.startsWith('vertical-') ? ('vertical' as const) : ('horizontal' as const),
        nested: name.startsWith('nested-'),
        composed: name === 'nested-composed'
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
    if (name === 'single-menu-switch') return menubarEntries.slice(0, 1);
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
