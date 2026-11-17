export interface HydrationSettings {
    value: number | null;
    controlled?: boolean;
    implicit?: boolean;
    presence?: boolean;
    prepaint?: boolean;
    vertical?: boolean;
    rtl?: boolean;
    authored?: boolean;
    multiple?: boolean;
    csp?: boolean;
    transformed?: boolean;
    zero?: boolean;
}
export const hydrationCases: Record<string, HydrationSettings> = {
    'hydration-default': { value: 1 },
    'hydration-presence': { value: 1, presence: true },
    'hydration-controlled': { value: 1, controlled: true },
    'hydration-implicit': { value: 0, implicit: true },
    'hydration-null': { value: null, controlled: true },
    'hydration-authored': { value: 1, authored: true, presence: true },
    'hydration-multiple': { value: 1, multiple: true },
    'hydration-prepaint': { value: 1, prepaint: true },
    'hydration-prepaint-vertical': { value: 1, prepaint: true, vertical: true },
    'hydration-prepaint-rtl': { value: 1, prepaint: true, rtl: true },
    'hydration-prepaint-csp': { value: 1, prepaint: true, csp: true },
    'hydration-prepaint-transformed': { value: 1, prepaint: true, transformed: true },
    'hydration-prepaint-zero': { value: 1, prepaint: true, zero: true },
    'hydration-prepaint-multiple': { value: 1, prepaint: true, multiple: true }
};
export function hydrationSettings(url: string): HydrationSettings {
    const name = new URL(url, 'http://localhost').searchParams.get('case') ?? 'hydration-default';
    const settings = hydrationCases[name];
    if (!settings) throw new Error(`Unknown Tabs hydration case: ${name}`);
    return settings;
}
export const hydrationNonce = 'tabs-hydration-fixture';
export const hydrationClasses = {
    root: 'grid gap-4',
    list: 'relative flex w-96 gap-2 border border-border p-2',
    vertical: 'relative flex w-28 flex-col gap-2 border border-border p-2',
    tab: 'h-10 w-20 flex-none',
    panel: 'h-24 border border-border p-2',
    indicator:
        'pointer-events-none absolute left-0 top-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top) bg-primary/20'
};
export interface HydrationChange {
    group: number;
    value: unknown;
    reason: string;
}
export interface HydrationProbe {
    ready: boolean;
    changes: HydrationChange[];
    errors: string[];
    reference: { commit: string; packageVersion: string; digest: string };
}
declare global {
    interface Window {
        tabsHydration: HydrationProbe;
    }
}
