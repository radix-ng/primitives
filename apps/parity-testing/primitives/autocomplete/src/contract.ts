import { navigationCases, type NavigationSettings } from './navigation';
export interface Settings {
    navigation?: NavigationSettings;
    value?: string;
    open?: boolean;
    defaultValue?: string;
    defaultOpen?: boolean;
}
export const initialCases = {
    'initial-omitted': {},
    'initial-default-value': { defaultValue: 'Seed' },
    'initial-default-open': { defaultOpen: true },
    'initial-explicit-empty': { value: '', defaultValue: 'Seed' },
    'initial-explicit-closed': { open: false, defaultOpen: true },
    'initial-explicit-value': { value: 'External', defaultValue: 'Seed' },
    'initial-explicit-open': { open: true, defaultOpen: false },
    'initial-explicit-falsy': { value: '', open: false, defaultValue: 'Seed', defaultOpen: true },
    'initial-late-defaults': {},
    'initial-changed-defaults': { defaultValue: 'Seed' },
    'initial-clear-then-defaults': { defaultValue: 'Seed', defaultOpen: true },
    'initial-close-then-defaults': { defaultValue: 'Seed', defaultOpen: true },
    'initial-external-updates': { value: '', open: false, defaultValue: 'Seed', defaultOpen: true },
    'initial-remount-defaults': { defaultValue: 'Seed' }
} satisfies Record<string, Settings>;
export type CaseName = keyof typeof initialCases | keyof typeof navigationCases;
export const cases: Record<CaseName, Settings> = { ...initialCases, ...navigationCases };
export function config(): { name: CaseName; settings: Settings } {
    const name = new URLSearchParams(location.search).get('case') ?? 'initial-omitted';
    if (!Object.hasOwn(cases, name)) throw new Error(`Unknown Autocomplete case: ${name}`);
    return { name: name as CaseName, settings: cases[name as CaseName] };
}
export interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    requests: { kind: 'value' | 'open'; value: string | boolean; canceled: boolean }[];
    details: unknown[];
    highlights: { value: unknown; index: number; reason: string }[];
    keys: Record<string, unknown>[];
    modelOutputs: { kind: 'value' | 'open'; value: string | boolean }[];
}
declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        autocompleteParity: Probe;
    }
}
export function installProbe() {
    const probe: Probe = {
        reference: __PARITY_REFERENCE__,
        requests: [],
        details: [],
        highlights: [],
        keys: [],
        modelOutputs: []
    };
    window.autocompleteParity = probe;
    return {
        probe,
        change(
            kind: 'value' | 'open',
            value: string | boolean,
            reason: string,
            canceled: boolean,
            event: Event,
            trigger?: Element
        ) {
            probe.requests.push({ kind, value, canceled });
            probe.details.push({
                kind,
                value,
                reason,
                canceled,
                event: {
                    type: event.type,
                    trusted: event.isTrusted,
                    target: (event.target as Element | null)?.getAttribute?.('data-testid') ?? null
                },
                trigger: trigger?.id ?? null
            });
        }
    };
}
export const classes = {
    control: 'flex w-80 gap-2',
    input: 'border-border rounded border px-3 py-2',
    popup: 'bg-background border-border rounded border p-2',
    item: 'px-3 py-2 data-highlighted:bg-muted'
};
