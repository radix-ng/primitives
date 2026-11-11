import { createMenuProbe, type MenuProbe } from '../../../shared/menu-probe';
import { rootRemovalCases, rootRemovalConfig } from '../../../shared/root-removal';
import { compositionCases } from './composition';
export const cases = [
    'right-open',
    'point-anchor',
    'select',
    'cancel-open',
    'cancel-close',
    'disabled',
    'outside',
    'repeat-open',
    'right-release',
    'keep-mounted',
    'return-focus',
    'keyboard-context',
    'keyboard-shift-f10',
    'touch-tap',
    'touch-long-press',
    'touch-drift',
    'touch-diagonal-slop',
    'touch-cancel',
    'touch-multitouch',
    'touch-disabled',
    ...compositionCases,
    ...rootRemovalCases.filter((name) => name !== 'root-remove-nonmodal')
] as const;
export function config() {
    const name = new URLSearchParams(location.search).get('case') ?? 'right-open';
    if (!cases.includes(name as (typeof cases)[number])) throw new Error(`Unknown Context Menu case: ${name}`);
    const removal = rootRemovalConfig(name);
    return {
        name,
        removal,
        disabled: name === 'disabled' || name === 'touch-disabled',
        keepMounted: name === 'keep-mounted' || name === 'areas-keep-mounted' || !!removal?.retained,
        nested: name.startsWith('composition-') || !!removal?.nested,
        multiple: name.startsWith('areas-'),
        nestedAreas: name.startsWith('areas-nested'),
        dir: name.endsWith('-rtl') ? ('rtl' as const) : ('ltr' as const),
        side: 'right' as const
    };
}
export type Layer = 'context' | 'context-sub';
export type Probe = MenuProbe<ReturnType<typeof config>, Layer>;
declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        contextMenuParity: Probe;
    }
}
export function installProbe(framework: string) {
    const trace = createMenuProbe(framework, __PARITY_REFERENCE__, config(), ['context', 'context-sub'] as const);
    window.contextMenuParity = trace.probe;
    return trace;
}
