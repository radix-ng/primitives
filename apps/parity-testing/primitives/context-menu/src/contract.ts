import { createMenuProbe, type MenuProbe } from '../../../shared/menu-probe';
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
    'touch-disabled'
] as const;
export function config() {
    const name = new URLSearchParams(location.search).get('case') ?? 'right-open';
    if (!cases.includes(name as (typeof cases)[number])) throw new Error(`Unknown Context Menu case: ${name}`);
    return {
        name,
        disabled: name === 'disabled' || name === 'touch-disabled',
        keepMounted: name === 'keep-mounted',
        side: 'right' as const
    };
}
export type Probe = MenuProbe<ReturnType<typeof config>, 'context'>;
declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        contextMenuParity: Probe;
    }
}
export function installProbe(framework: string) {
    const trace = createMenuProbe(framework, __PARITY_REFERENCE__, config(), ['context'] as const);
    window.contextMenuParity = trace.probe;
    return trace;
}
