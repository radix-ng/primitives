import { collectionCases, type MenuEntry } from '../../../shared/menu-collection';
import { createMenuProbe, type MenuProbe } from '../../../shared/menu-probe';
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
    'collection-disable-open'
] as const;
export function config() {
    const name = new URLSearchParams(location.search).get('case') ?? 'open-keyboard';
    if (!cases.includes(name as (typeof cases)[number])) throw new Error(`Unknown Menubar case: ${name}`);
    return {
        name,
        dir: name === 'rtl-switch' || name.endsWith('-rtl') ? ('rtl' as const) : ('ltr' as const),
        disabled: name === 'disabled',
        keepMounted: false,
        side: 'bottom' as const
    };
}
export type Layer = 'file' | 'blocked' | 'edit' | 'new';
export const menubarEntries: MenuEntry<Layer>[] = [
    { id: 'file', label: 'file', disabled: false },
    { id: 'blocked', label: 'blocked', disabled: true },
    { id: 'edit', label: 'edit', disabled: false }
];
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
        'new'
    ] as const);
    document.documentElement.dir = trace.probe.config.dir;
    window.menubarParity = trace.probe;
    return trace;
}
