import type { Settings, Value } from './contract';

export type ActivationHost = 'button' | 'div' | 'link' | 'anchor';
export interface ActivationSettings {
    host: ActivationHost;
    key?: 'Enter' | 'Space';
    cancel?: 'first' | 'all';
    disabled?: boolean;
    click?: boolean;
    repeat?: boolean;
    modified?: boolean;
    descendant?: boolean;
    prevent?: boolean;
    secondary?: 'right' | 'middle';
}

const cases: Record<`activation-${string}`, Settings> = {};
const add = (name: string, activation: ActivationSettings) => {
    cases[`activation-${name}`] = { options: [], activation };
};
for (const host of ['button', 'div', 'link', 'anchor'] as const) {
    for (const key of ['Enter', 'Space'] as const) {
        const name = `${host}-${key.toLowerCase()}`;
        add(name, { host, key });
        if (host !== 'anchor') {
            add(`cancel-${name}`, { host, key, cancel: 'first' });
            add(`repeat-${name}`, { host, key, repeat: true, cancel: 'all' });
            add(`disabled-${name}`, { host, key, disabled: true });
        }
    }
    if (host !== 'anchor') add(`disabled-${host}-click`, { host, disabled: true, click: true });
}
for (const host of ['button', 'div', 'link'] as const) {
    add(`modified-${host}-space`, { host, key: 'Space', modified: true });
    add(`prevent-${host}-enter`, { host, key: 'Enter', prevent: true });
}
add('modified-div-enter', { host: 'div', key: 'Enter', modified: true });
for (const key of ['Enter', 'Space'] as const)
    add(`descendant-${key.toLowerCase()}`, { host: 'div', key, descendant: true });
for (const secondary of ['right', 'middle'] as const) add(`held-${secondary}`, { host: 'button', secondary });
export const activationCases = cases;

export interface ActivationProbe {
    timeline: Record<string, unknown>[];
    callbacks: Record<string, unknown>[];
    triggers: (string | null)[];
    submits: number;
}
declare global {
    interface Window {
        tabsActivation: ActivationProbe;
    }
}

export function installActivationProbe(settings: ActivationSettings) {
    const probe: ActivationProbe = { timeline: [], callbacks: [], triggers: [], submits: 0 };
    window.tabsActivation = probe;
    const eventInfo = (event: Event) => {
        const key = event as KeyboardEvent;
        return {
            type: event.type,
            trusted: event.isTrusted,
            target: (event.target as HTMLElement | null)?.getAttribute('data-testid') ?? null,
            ...(event.type.startsWith('key') ? { key: key.key, repeat: key.repeat } : {}),
            shift: !!key.shiftKey,
            ctrl: !!key.ctrlKey,
            alt: !!key.altKey,
            meta: !!key.metaKey
        };
    };
    for (const type of ['keydown', 'keyup', 'click', 'pointerdown', 'pointerup', 'focusin', 'contextmenu']) {
        for (const capture of [true, false]) {
            document.addEventListener(
                type,
                (event) => {
                    if (!(event.target as Element | null)?.closest('[role="tab"]')) return;
                    if (type === 'focusin' && !settings.secondary) return;
                    // Keep the OS context menu from consuming the native secondary pointerup under test.
                    if (settings.secondary && type === 'contextmenu') event.preventDefault();
                    if (type.startsWith('key') && !['Enter', ' '].includes((event as KeyboardEvent).key)) return;
                    if (capture && settings.prevent && type === 'keydown' && (event as KeyboardEvent).key === 'Enter')
                        event.preventDefault();
                    probe.timeline.push({
                        phase: capture ? 'capture' : 'bubble',
                        ...eventInfo(event),
                        prevented: event.defaultPrevented
                    });
                },
                capture
            );
        }
    }
    return {
        probe,
        change(value: Value, reason: string, direction: string, canceled: boolean, event: Event, trigger?: Element) {
            const record = { value, reason, direction, canceled, ...eventInfo(event) };
            probe.callbacks.push(record);
            probe.triggers.push(trigger?.getAttribute('data-testid') ?? null);
            probe.timeline.push({ phase: 'change', ...record });
        },
        submit(event: Event) {
            event.preventDefault();
            probe.submits++;
        }
    };
}
