export const cases = [
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
export type CaseName = (typeof cases)[number];
export type Layer = 'main' | 'sub';
export interface Change {
    layer: Layer;
    open: boolean;
    reason: string;
    canceled: boolean;
    trigger: string | null;
}
export interface ValueChange {
    value: boolean | string;
    reason: string;
    canceled: boolean;
}
export interface Probe {
    framework: string;
    reference: { commit: string; packageVersion: string; digest: string };
    config: ReturnType<typeof config>;
    changes: Change[];
    completions: Record<Layer, boolean[]>;
    nativeEvents: { layer: Layer; type: string; trusted: boolean }[];
    pointerMoves: {
        trusted: boolean;
        clientX: number;
        clientY: number;
        movementX: number;
        movementY: number;
        pointerType: string;
    }[];
    values: ValueChange[];
    selected: string[];
    activations: number;
}
declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        menuParity: Probe;
    }
}
export function config() {
    const name = new URLSearchParams(location.search).get('case') ?? 'keyboard-enter';
    if (!cases.includes(name as CaseName)) throw new Error(`Unknown Menu case: ${name}`);
    return {
        name: name as CaseName,
        dir: name === 'submenu-rtl' ? ('rtl' as const) : ('ltr' as const),
        modal: !['outside-nonmodal', 'focus-out'].includes(name),
        loop: name !== 'no-loop',
        disabled: name === 'disabled-trigger',
        checkbox: name.startsWith('checkbox'),
        radio: name.startsWith('radio'),
        submenu: name.startsWith('submenu'),
        label: name === 'explicit-label' ? 'Zebra' : undefined,
        ids: name.endsWith('-ids')
    };
}
export function installProbe(framework: string) {
    const settings = config();
    document.documentElement.dir = settings.dir;
    const probe: Probe = {
        framework,
        reference: __PARITY_REFERENCE__,
        config: settings,
        changes: [],
        completions: { main: [], sub: [] },
        nativeEvents: [],
        pointerMoves: [],
        values: [],
        selected: [],
        activations: 0
    };
    window.menuParity = probe;
    document.addEventListener(
        'pointermove',
        (event) =>
            probe.pointerMoves.push({
                trusted: event.isTrusted,
                clientX: event.clientX,
                clientY: event.clientY,
                movementX: event.movementX,
                movementY: event.movementY,
                pointerType: event.pointerType
            }),
        true
    );
    return {
        probe,
        change(layer: Layer, open: boolean, reason: string, canceled: boolean, event: Event, trigger?: Element | null) {
            probe.changes.push({
                layer,
                open,
                reason,
                canceled,
                trigger: trigger?.getAttribute('data-testid') ?? null
            });
            probe.nativeEvents.push({ layer, type: event.type, trusted: event.isTrusted });
        },
        value(value: boolean | string, reason: string, canceled: boolean) {
            probe.values.push({ value, reason, canceled });
        },
        complete(layer: Layer, open: boolean) {
            probe.completions[layer].push(open);
        },
        select(id: string) {
            probe.selected.push(id);
        }
    };
}
export const classes = {
    layout: 'fixed start-24 top-16 grid w-60 gap-3',
    trigger: 'border-border bg-background rounded border px-4 py-2',
    popup: 'border-border bg-popover text-popover-foreground grid w-60 gap-1 rounded border p-1 shadow-md outline-none',
    item: 'text-foreground rounded px-3 py-2 text-start outline-none data-[highlighted]:bg-muted data-[disabled]:opacity-50',
    outside: 'border-border border p-2'
};
