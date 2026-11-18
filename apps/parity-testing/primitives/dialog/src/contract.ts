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
}

export const configurations = {
    'initial-open': { defaultOpen: true },
    'late-default': {},
    'controlled-false': { open: false, defaultOpen: true, defer: true },
    'controlled-deferred': { open: false, defer: true },
    'cancel-open': { cancelOpen: true },
    'modal-background': {},
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

export interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    changes: { open: boolean; reason: string; trigger: string | null; canceled: boolean }[];
    completions: boolean[];
    nativeEvents: { type: string; trusted: boolean }[];
    activations: number;
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

export function installProbe() {
    const probe: Probe = {
        reference: __PARITY_REFERENCE__,
        changes: [],
        completions: [],
        nativeEvents: [],
        activations: 0
    };
    window.dialogParity = probe;
    return {
        probe,
        change(open: boolean, reason: string, event: Event, trigger: Element | undefined, canceled: boolean) {
            probe.changes.push({ open, reason, trigger: trigger?.getAttribute('data-testid') ?? null, canceled });
            probe.nativeEvents.push({ type: event.type, trusted: event.isTrusted });
        }
    };
}

export const classes = {
    trigger: 'border-border bg-background rounded border px-4 py-2',
    backdrop: 'fixed inset-0 bg-foreground/20',
    popup: 'border-border bg-popover text-popover-foreground fixed start-1/2 top-1/2 grid w-64 -translate-x-1/2 -translate-y-1/2 gap-3 rounded border p-4',
    input: 'border-border bg-background rounded border p-2'
};
