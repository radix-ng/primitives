import { lifecycleCases, lifecycleConfig } from '../../../shared/lifecycle';
import { menuCollectionCases } from '../../../shared/menu-collection';
import { createMenuProbe, type MenuProbe } from '../../../shared/menu-probe';
import { rootRemovalCases, rootRemovalConfig } from '../../../shared/root-removal';
import { dialogMenuCases, dialogMenuConfig, type DialogProbe } from './dialog';
import { emptyCases, emptyConfig } from './empty';
import { focusBoundaryCases, focusBoundaryConfig } from './focus-boundary';
import { handleOverlapCases } from './handle-overlap';
import { highlightCases, highlightConfig, type createHighlightRecorder } from './highlight';
import { hostCases, hostConfig, type HostClick } from './hosts';
import { hybridCases } from './hybrid';
import { initialFocusCases } from './initial-focus';
import { itemDialogCases, itemDialogConfig } from './item-dialog';
import { pointerCases, pointerConfig } from './pointer';
import { projectionCases, projectionConfig } from './projection';
import { touchCases, touchConfig } from './touch';
import { multiTriggerCases, multiTriggerConfig } from './triggers';

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
    ...highlightCases,
    ...multiTriggerCases,
    ...handleOverlapCases,
    ...dialogMenuCases,
    ...itemDialogCases,
    ...lifecycleCases,
    ...pointerCases,
    ...menuCollectionCases,
    ...emptyCases,
    ...touchCases,
    ...hybridCases,
    ...hostCases,
    ...initialFocusCases,
    ...focusBoundaryCases,
    ...projectionCases,
    ...rootRemovalCases,
    'lifecycle-submenu-css'
] as const;
export type CaseName = (typeof cases)[number];
export type Layer = 'main' | 'sub';
export type Probe = MenuProbe<ReturnType<typeof config>, Layer> & {
    hostClicks?: HostClick[];
    hostSubmissions?: number;
    finalFocusCalls?: { layer: Layer; type: string | null }[];
    highlights?: ReturnType<typeof createHighlightRecorder>;
    handleOpen?: () => boolean;
    dialog?: DialogProbe;
};
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
    const host = hostConfig(name);
    const focusBoundary = focusBoundaryConfig(name);
    const projection = projectionConfig(name);
    const multiTrigger = multiTriggerConfig(name);
    const dialog = dialogMenuConfig(name);
    const itemDialog = itemDialogConfig(name);
    return {
        name: name as CaseName,
        dir: name.endsWith('-rtl') ? ('rtl' as const) : ('ltr' as const),
        removal,
        empty,
        touch,
        host,
        focusBoundary,
        projection,
        highlight: highlightConfig(name),
        multiTrigger,
        dialog,
        itemDialog,
        modal:
            focusBoundary?.target?.key === 'outside'
                ? false
                : projection
                  ? !projection.cancelFocus
                  : removal
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
            itemDialog?.nested ||
            dialog?.nested ||
            highlightConfig(name)?.nested ||
            projection?.nested ||
            touch?.submenu ||
            empty?.nested ||
            removal?.nested ||
            name.startsWith('submenu') ||
            name.startsWith('hover-submenu') ||
            name.startsWith('collection-submenu') ||
            name === 'lifecycle-submenu-css',
        collectionOnly: name === 'collection-empty-refill' || (!!empty && !empty.nested),
        label: ['explicit-label', 'highlight-explicit-label'].includes(name) ? 'Zebra' : undefined,
        ids: name.endsWith('-ids'),
        lifecycle:
            dialog || itemDialog
                ? {
                      keepMounted: (dialog ?? itemDialog)!.retained,
                      animated: (dialog ?? itemDialog)!.animated,
                      deferred: (dialog ?? itemDialog)!.deferred,
                      canceled: dialog?.canceled ?? itemDialog!.canceledClose,
                      late: false
                  }
                : multiTrigger?.lifecycle
                  ? {
                        keepMounted: multiTrigger.retained,
                        animated: !multiTrigger.lifecycle.deferred,
                        deferred: multiTrigger.lifecycle.deferred,
                        canceled: false,
                        late: false
                    }
                  : multiTrigger?.retained
                    ? { keepMounted: true, animated: false, deferred: false, canceled: false, late: false }
                    : focusBoundary
                      ? {
                            keepMounted: focusBoundary.retained,
                            animated: false,
                            deferred: false,
                            canceled: false,
                            late: false
                        }
                      : removal
                        ? {
                              keepMounted: removal.retained,
                              animated: removal.animated,
                              deferred: removal.deferred,
                              canceled: false,
                              late: false
                          }
                        : lifecycleConfig(
                              highlightConfig(name)?.retained ||
                                  empty?.retained ||
                                  touch?.retained ||
                                  host?.retained ||
                                  projection?.retained
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
    return { ...trace, probe: trace.probe as Probe };
}
export const classes = {
    layout: 'fixed start-24 top-16 grid w-60 gap-3',
    trigger: 'border-border bg-background rounded border px-4 py-2',
    popup: 'border-border bg-popover text-popover-foreground grid w-60 gap-1 rounded border p-1 shadow-md outline-none',
    item: 'text-foreground rounded px-3 py-2 text-start outline-none data-[highlighted]:bg-muted data-[disabled]:opacity-50',
    outside: 'border-border border p-2'
};
