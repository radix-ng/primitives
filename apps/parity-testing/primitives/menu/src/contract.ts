import { lifecycleCases, lifecycleConfig } from '../../../shared/lifecycle';
import { menuCollectionCases } from '../../../shared/menu-collection';
import { createMenuProbe, type MenuProbe } from '../../../shared/menu-probe';
import { rootRemovalCases, rootRemovalConfig } from '../../../shared/root-removal';
import { emptyCases, emptyConfig } from './empty';
import { pointerCases, pointerConfig } from './pointer';
import { touchCases, touchConfig } from './touch';

export const basicCases = [
    'keyboard-enter',
    'keyboard-space',
    'keyboard-up',
    'keyboard-down',
    'pointer-open',
    'pointer-tab',
    'navigation',
    'no-loop',
    'typeahead',
    'explicit-label',
    'pointer-highlight',
    'pointer-select',
    'keyboard-select',
    'space-select',
    'stay-open',
    'disabled-trigger',
    'disabled-item',
    'cancel-open',
    'cancel-close',
    'outside-modal',
    'outside-nonmodal',
    'focus-out',
    'tab',
    'shift-tab',
    'checkbox',
    'checkbox-cancel',
    'radio',
    'radio-cancel',
    'submenu-ltr',
    'submenu-rtl',
    'submenu-enter',
    'submenu-select',
    'custom-ids',
    'dynamic-ids'
] as const;
export const cases = [
    ...basicCases,
    ...lifecycleCases,
    ...pointerCases,
    ...menuCollectionCases,
    ...emptyCases,
    ...touchCases,
    ...rootRemovalCases,
    'lifecycle-submenu-css'
] as const;
export type CaseName = (typeof cases)[number];
export type Layer = 'main' | 'sub';
export type Probe = MenuProbe<ReturnType<typeof config>, Layer>;
declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        menuParity: Probe;
    }
}
export function config() {
    const name = new URLSearchParams(location.search).get('case') ?? 'keyboard-enter';
    if (!cases.includes(name as CaseName)) throw new Error(`Unknown Menu case: ${name}`);
    const removal = rootRemovalConfig(name);
    const empty = emptyConfig(name);
    const touch = touchConfig(name);
    return {
        name: name as CaseName,
        dir: name.endsWith('-rtl') ? ('rtl' as const) : ('ltr' as const),
        removal,
        empty,
        touch,
        modal: removal
            ? removal.modal
            : name.startsWith('lifecycle-')
              ? name === 'lifecycle-modal-keep'
              : !['outside-nonmodal', 'focus-out', 'touch-outside-nonmodal'].includes(name),
        loop: name !== 'no-loop',
        disabled: ['disabled-trigger', 'hover-root-disabled', 'touch-disabled-trigger'].includes(name),
        checkbox:
            name.startsWith('checkbox') ||
            name.startsWith('lifecycle-') ||
            name === 'drag-checkbox' ||
            ['touch-checkbox', 'touch-disabled-checkbox'].includes(name),
        radio:
            name.startsWith('radio') || name === 'drag-radio' || ['touch-radio', 'touch-disabled-radio'].includes(name),
        submenu:
            touch?.submenu ||
            empty?.nested ||
            removal?.nested ||
            name.startsWith('submenu') ||
            name.startsWith('hover-submenu') ||
            name.startsWith('collection-submenu') ||
            name === 'lifecycle-submenu-css',
        collectionOnly: name === 'collection-empty-refill' || (!!empty && !empty.nested),
        label: name === 'explicit-label' ? 'Zebra' : undefined,
        ids: name.endsWith('-ids'),
        lifecycle: removal
            ? {
                  keepMounted: removal.retained,
                  animated: removal.animated,
                  deferred: removal.deferred,
                  canceled: false,
                  late: false
              }
            : lifecycleConfig(
                  empty?.retained || touch?.retained
                      ? 'lifecycle-keep'
                      : name === 'lifecycle-submenu-css'
                        ? 'lifecycle-css-exit'
                        : name
              ),
        pointer: pointerConfig(name)
    };
}
export function installProbe(framework: string) {
    const trace = createMenuProbe(framework, __PARITY_REFERENCE__, config(), ['main', 'sub'] as const);
    document.documentElement.dir = trace.probe.config.dir;
    window.menuParity = trace.probe;
    return trace;
}
export const classes = {
    layout: 'fixed start-24 top-16 grid w-60 gap-3',
    trigger: 'border-border bg-background rounded border px-4 py-2',
    popup: 'border-border bg-popover text-popover-foreground grid w-60 gap-1 rounded border p-1 shadow-md outline-none',
    item: 'text-foreground rounded px-3 py-2 text-start outline-none data-[highlighted]:bg-muted data-[disabled]:opacity-50',
    outside: 'border-border border p-2'
};
