export interface DetachedSettings {
    secondary?: boolean;
    initiallyDetached?: boolean;
    swap?: boolean;
    openId?: 'primary' | 'secondary' | 'missing';
    controlled?: boolean;
}

type FocusMode = 'elements' | 'disabled' | 'callback' | 'undefined' | 'null';
type TouchMode = 'tap' | 'popup-pan' | 'page-pan' | 'cancel' | 'multitouch';

interface Settings {
    open?: boolean;
    defaultOpen?: boolean;
    triggerId?: string | null;
    defaultTriggerId?: string;
    multiple?: boolean;
    defer?: boolean;
    cancelOpen?: boolean;
    keepMounted?: boolean;
    hold?: boolean;
    animate?: boolean;
    modal?: false | 'trap-focus';
    disablePointerDismissal?: boolean;
    backdrop?: boolean;
    nested?: { grandchild?: boolean; keepMounted?: boolean; forceRender?: boolean; animate?: boolean };
    overlap?: { backdrop: boolean; keepMounted?: boolean };
    mixed?: 'dialog' | 'alert-dialog';
    detached?: DetachedSettings;
    focus?: FocusMode;
    touch?: TouchMode;
}

export const configurations = {
    'initial-open': { defaultOpen: true },
    'late-default': {},
    'controlled-false': { open: false, defaultOpen: true, defer: true },
    'controlled-deferred': { open: false, defer: true },
    'cancel-open': { cancelOpen: true },
    'modal-background': {},
    'non-modal-tab-out': { modal: false },
    'non-modal-pointer': { modal: false },
    'non-modal-pointer-focus': { modal: false },
    'non-modal-dismissal-disabled': { modal: false, disablePointerDismissal: true },
    'trap-focus-pointer': { modal: 'trap-focus' },
    'trap-focus-dismissal-disabled': { modal: 'trap-focus', disablePointerDismissal: true },
    'trap-focus-authored-backdrop': { modal: 'trap-focus', backdrop: true },
    'nested-escape': { nested: {} },
    'nested-outside-press': { nested: {} },
    'nested-depth': { nested: { grandchild: true } },
    'nested-remove': { nested: { grandchild: true } },
    'nested-retained-exit': { nested: { keepMounted: true, forceRender: true, animate: true } },
    'overlap-authored-backdrops': { overlap: { backdrop: true } },
    'overlap-internal-backdrops': { overlap: { backdrop: false } },
    'overlap-escape': { overlap: { backdrop: false } },
    'overlap-retained-escape': { overlap: { backdrop: false, keepMounted: true } },
    'overlap-retained-backdrops': { overlap: { backdrop: true, keepMounted: true } },
    'mixed-drawers-dialog': { mixed: 'dialog' },
    'mixed-drawers-alert-dialog': { mixed: 'alert-dialog' },
    'detached-live-payload': { detached: { secondary: true } },
    'detached-trigger-remount': { detached: { secondary: true, openId: 'secondary' } },
    'detached-root-remount': { detached: { initiallyDetached: true } },
    'detached-handle-swap': { detached: { secondary: true, swap: true } },
    'detached-unassociated': { detached: {} },
    'detached-missing-trigger': { detached: { openId: 'missing' } },
    'detached-programmatic-payload': { detached: { openId: 'secondary', controlled: true } },
    'detached-refused-close': { detached: { controlled: true } },
    'focus-elements': { focus: 'elements' },
    'focus-disabled': { focus: 'disabled', modal: false, disablePointerDismissal: true },
    'focus-keyboard-policy': { focus: 'callback' },
    'focus-pointer-policy': { focus: 'callback' },
    'focus-undefined-policy': { focus: 'undefined', modal: false, disablePointerDismissal: true },
    'focus-null-policy': { focus: 'null' },
    'focus-retained-exit': { focus: 'callback', keepMounted: true, animate: true },
    'focus-trigger-removed': { focus: 'callback' },
    'touch-default-focus': { touch: 'tap' },
    'touch-focus-policy': { touch: 'tap', focus: 'callback' },
    'touch-outside-modal': { touch: 'tap' },
    'touch-outside-internal-backdrop': { touch: 'tap', backdrop: false },
    'touch-outside-nonmodal': { touch: 'tap', modal: false },
    'touch-outside-trap-focus': { touch: 'tap', modal: 'trap-focus' },
    'touch-dismissal-disabled': { touch: 'tap', modal: 'trap-focus', disablePointerDismissal: true },
    'touch-pan-popup': { touch: 'popup-pan' },
    'touch-pan-outside-nonmodal': { touch: 'page-pan', modal: false },
    'touch-pan-outside-modal': { touch: 'page-pan' },
    'touch-cancel-outside': { touch: 'cancel', modal: 'trap-focus' },
    'touch-multitouch-outside': { touch: 'multitouch', modal: false },
    'trigger-default-fallback': {
        defaultOpen: true,
        triggerId: 'secondary',
        defaultTriggerId: 'primary',
        multiple: true
    },
    'trigger-registration': { multiple: true },
    'automatic-disposable': {},
    'automatic-retained': { keepMounted: true },
    'held-disposable': { hold: true },
    'held-retained': { hold: true, keepMounted: true },
    'held-interruption': { hold: true },
    'same-batch-release': { open: false, hold: true },
    'css-exit': { animate: true }
} satisfies Record<string, Settings>;

export type CaseName = keyof typeof configurations;
export const nestedLayers = ['child', 'grandchild'] as const;
export type NestedLayer = (typeof nestedLayers)[number];
export const overlappingLayers = ['first', 'second', 'third'] as const;
export type OverlappingLayer = (typeof overlappingLayers)[number];
type Change = { open: boolean; reason: string; trigger: string | null; canceled: boolean };
type FocusPhase = 'initial' | 'final';

export interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    changes: Change[];
    completions: boolean[];
    nestedChanges: (Change & { layer: NestedLayer })[];
    nestedCompletions: { layer: NestedLayer; open: boolean }[];
    overlappingChanges: (Change & { layer: OverlappingLayer })[];
    overlappingCompletions: { layer: OverlappingLayer; open: boolean }[];
    nativeEvents: { type: string; trusted: boolean; layer?: NestedLayer | OverlappingLayer }[];
    activations: number;
    focusPolicies: { phase: FocusPhase; interaction: string | null }[];
    touchEvents: {
        type: string;
        trusted: boolean;
        pointerType: string | null;
        touches: number | null;
        changedTouches: number | null;
        target: string | null;
    }[];
    readHandles?: () => boolean[];
}

declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        dialogParity: Probe;
    }
}

export function config(): Settings {
    const name = new URLSearchParams(location.search).get('case') ?? 'initial-open';
    if (!Object.hasOwn(configurations, name)) throw new Error(`Unknown Dialog case: ${name}`);
    return configurations[name as CaseName];
}

export function touchMode(name: string): TouchMode | undefined {
    return Object.hasOwn(configurations, name) ? (configurations[name as CaseName] as Settings).touch : undefined;
}

export function installProbe() {
    const probe: Probe = {
        reference: __PARITY_REFERENCE__,
        changes: [],
        completions: [],
        nestedChanges: [],
        nestedCompletions: [],
        overlappingChanges: [],
        overlappingCompletions: [],
        nativeEvents: [],
        activations: 0,
        focusPolicies: [],
        touchEvents: []
    };
    window.dialogParity = probe;
    if (config().touch) {
        for (const type of [
            'touchstart',
            'touchmove',
            'touchend',
            'touchcancel',
            'pointerdown',
            'pointercancel',
            'mousedown',
            'click'
        ]) {
            document.addEventListener(
                type,
                (event) => {
                    const touch = 'touches' in event ? (event as TouchEvent) : undefined;
                    probe.touchEvents.push({
                        type,
                        trusted: event.isTrusted,
                        pointerType: event instanceof PointerEvent ? event.pointerType : null,
                        touches: touch?.touches.length ?? null,
                        changedTouches: touch?.changedTouches.length ?? null,
                        target:
                            event.target instanceof Element
                                ? (event.target.closest('[data-testid]')?.getAttribute('data-testid') ?? null)
                                : null
                    });
                },
                { capture: true, passive: true }
            );
        }
    }
    return {
        probe,
        change(
            open: boolean,
            reason: string,
            event: Event,
            trigger: Element | undefined,
            canceled: boolean,
            layer?: NestedLayer | OverlappingLayer
        ) {
            const change = { open, reason, trigger: trigger?.getAttribute('data-testid') ?? null, canceled };
            if (layer === 'child' || layer === 'grandchild') probe.nestedChanges.push({ layer, ...change });
            else if (layer) probe.overlappingChanges.push({ layer, ...change });
            else probe.changes.push(change);
            probe.nativeEvents.push({ type: event.type, trusted: event.isTrusted, layer });
        }
    };
}

export function chooseFocus(
    probe: Probe,
    mode: FocusMode | undefined,
    phase: FocusPhase,
    interaction: string | null,
    target: HTMLElement | null
) {
    probe.focusPolicies.push({ phase, interaction });
    if (mode === 'undefined') return undefined;
    if (mode === 'null') return null;
    if (phase === 'initial' && (interaction === 'mouse' || interaction === 'touch')) return true;
    return target;
}

export const classes = {
    trigger: 'border-border bg-background rounded border px-4 py-2',
    backdrop: 'fixed inset-0 bg-foreground/20',
    popup: 'border-border bg-popover text-popover-foreground fixed start-1/2 top-1/2 grid w-64 -translate-x-1/2 -translate-y-1/2 gap-3 rounded border p-4',
    input: 'border-border bg-background rounded border p-2'
};
