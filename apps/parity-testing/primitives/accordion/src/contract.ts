export interface Settings {
    multiple?: boolean;
    controlled?: boolean;
    initial?: string[];
    defaults?: string[];
    veto?: 'item' | 'root';
    disabled?: 'root' | 'item' | 'trigger';
    span?: boolean;
    key?: 'Enter' | 'Space';
    reveal?: boolean;
    authored?: boolean;
    submit?: boolean;
    preventClick?: boolean;
}
export const cases: Record<string, Settings> = {
    single: {},
    'prevent-click': { preventClick: true },
    'span-prevent-click': { span: true, preventClick: true },
    multiple: { multiple: true },
    'controlled-empty': { controlled: true },
    'controlled-default-conflict': { controlled: true, initial: ['b'], defaults: ['a'] },
    'item-veto-open': { veto: 'item' },
    'root-veto-open': { veto: 'root' },
    'item-veto-close': { veto: 'item', defaults: ['a'] },
    'root-veto-close': { veto: 'root', defaults: ['a'] },
    'native-enter': { key: 'Enter' },
    'native-space': { key: 'Space' },
    'span-enter': { span: true, key: 'Enter' },
    'span-space': { span: true, key: 'Space' },
    'native-disabled-root': { disabled: 'root' },
    'native-disabled-item': { disabled: 'item' },
    'native-disabled-trigger': { disabled: 'trigger' },
    'span-disabled': { span: true, disabled: 'trigger' },
    beforematch: { reveal: true, defaults: ['b'] },
    'beforematch-item-veto': { reveal: true, veto: 'item' },
    'beforematch-root-veto': { reveal: true, veto: 'root' },
    'beforematch-controlled': { reveal: true, controlled: true },
    'authored-ids': { authored: true },
    'authored-submit': { submit: true }
};
export function settings(): Settings {
    const name = new URLSearchParams(location.search).get('case') ?? 'single';
    if (!cases[name]) throw new Error(`Unknown Accordion case: ${name}`);
    return cases[name];
}
interface Details {
    reason: string;
    event: Event | { nativeEvent: Event };
    cancel(): void;
}
export interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    trace: { part: string; next: unknown; reason: string; type: string; target: string | null; shared: boolean }[];
    nativeEvents: { type: string; target: string | null }[];
    submits: number;
}
declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        accordionParity: Probe;
    }
}
export function installProbe(config: Settings) {
    const probe: Probe = { reference: __PARITY_REFERENCE__, trace: [], nativeEvents: [], submits: 0 };
    window.accordionParity = probe;
    let lastItemDetails: Details | undefined;
    for (const type of ['click', 'beforematch', 'keydown', 'keyup']) {
        document.addEventListener(
            type,
            (event) => {
                probe.nativeEvents.push({ type, target: (event.target as Element).getAttribute('data-testid') });
            },
            true
        );
    }
    return {
        request(part: string, next: unknown, details: Details) {
            const native = 'nativeEvent' in details.event ? details.event.nativeEvent : details.event;
            probe.trace.push({
                part,
                next,
                reason: details.reason,
                type: native.type,
                target: (native.target as Element | null)?.getAttribute('data-testid') ?? null,
                shared: part === 'root' ? lastItemDetails === details : true
            });
            if (part !== 'root') lastItemDetails = details;
            if ((config.veto === 'item' && part !== 'root') || (config.veto === 'root' && part === 'root'))
                details.cancel();
        },
        click(event: Event) {
            if (config.preventClick) event.preventDefault();
        },
        submit(event: Event) {
            event.preventDefault();
            probe.submits++;
        }
    };
}
