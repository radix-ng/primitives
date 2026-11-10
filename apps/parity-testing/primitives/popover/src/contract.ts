import { lifecycleCases, lifecycleConfig } from './lifecycle';

export const basicCases = [
    'keyboard',
    'pointer-close',
    'trigger-toggle',
    'disabled',
    'cancel-open',
    'cancel-close',
    'outside',
    'modal',
    'trap-focus',
    'initial-focus',
    'switch-trigger',
    'edit',
    'tracking',
    'frozen',
    'clipping'
] as const;
export const cases = [...basicCases, ...lifecycleCases] as const;
export type CaseName = (typeof cases)[number];
export interface Change {
    open: boolean;
    reason: string;
    canceled: boolean;
    trigger: string | null;
}
export interface Probe {
    framework: string;
    reference: { commit: string; packageVersion: string; digest: string };
    config: ReturnType<typeof config>;
    changes: Change[];
    completions: boolean[];
    nativeEvents: { type: string; trusted: boolean }[];
    activations: number;
}
declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        popoverParity: Probe;
    }
}
export function config() {
    const name = new URLSearchParams(location.search).get('case') ?? 'keyboard';
    if (!cases.includes(name as CaseName)) throw new Error(`Unknown Popover case: ${name}`);
    return {
        name: name as CaseName,
        modal: ['modal', 'lifecycle-modal-keep'].includes(name)
            ? (true as const)
            : name === 'trap-focus'
              ? ('trap-focus' as const)
              : (false as const),
        lifecycle: lifecycleConfig(name),
        initialFocus: ['initial-focus', 'trap-focus', 'modal'].includes(name) ? true : undefined,
        disabled: name === 'disabled',
        frozen: name === 'frozen',
        scrolling: name === 'clipping'
    };
}
export function installProbe(framework: string) {
    const probe: Probe = {
        framework,
        reference: __PARITY_REFERENCE__,
        config: config(),
        changes: [],
        completions: [],
        nativeEvents: [],
        activations: 0
    };
    window.popoverParity = probe;
    return {
        probe,
        change(open: boolean, reason: string, canceled: boolean, event: Event, trigger?: Element | null) {
            probe.changes.push({ open, reason, canceled, trigger: trigger?.getAttribute('data-testid') ?? null });
            probe.nativeEvents.push({ type: event.type, trusted: event.isTrusted });
        },
        complete(open: boolean) {
            probe.completions.push(open);
        }
    };
}
export const classes = {
    form: 'grid w-64 gap-3',
    trigger: 'border-border bg-background rounded border px-4 py-2',
    popup: 'border-border bg-popover text-popover-foreground grid w-64 gap-3 rounded border p-4 shadow-md',
    input: 'border-border bg-background rounded border p-2',
    shell: 'border-border fixed start-4 top-16 h-80 w-96 overflow-auto border'
};
