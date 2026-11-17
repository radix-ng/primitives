import { authoredCases, type Authored } from './authored';
import { interactionCases, type ConsumerKey, type Interaction } from './interaction';
import { toggleCases, type ToggleSettings } from './toggle';

export type Host = 'button' | 'div' | 'span' | 'link' | 'anchor';
export type ButtonType = 'button' | 'submit' | 'reset';
export interface Settings {
    host: Host;
    action:
        | 'keyboard'
        | 'pointer'
        | 'disabled'
        | 'dynamic'
        | 'descendant'
        | 'repeat'
        | 'blur'
        | 'interaction'
        | 'authored'
        | 'toggle';
    toggle?: ToggleSettings;
    authored?: Authored;
    interaction?: Interaction;
    key?: 'Enter' | 'Space';
    disabled?: boolean;
    focusableWhenDisabled?: boolean;
    type?: ButtonType;
    cancel?: 'keydown' | 'keyup' | 'click';
    modified?: boolean;
}
export const cases: Record<string, Settings> = {};
for (const host of ['button', 'div', 'span', 'link', 'anchor'] as const) {
    cases[`${host}-pointer`] = { host, action: 'pointer' };
    for (const key of ['Enter', 'Space'] as const)
        cases[`${host}-${key.toLowerCase()}`] = { host, action: 'keyboard', key };
    for (const focusableWhenDisabled of [false, true])
        cases[`${host}-disabled-${focusableWhenDisabled ? 'focusable' : 'unfocusable'}`] = {
            host,
            action: 'disabled',
            disabled: true,
            focusableWhenDisabled
        };
    cases[`${host}-dynamic`] = { host, action: 'dynamic' };
}
for (const host of ['button', 'div', 'span', 'link'] as const) {
    cases[`${host}-prevent-enter-keydown`] = { host, action: 'keyboard', key: 'Enter', cancel: 'keydown' };
    cases[`${host}-prevent-space-keyup`] = { host, action: 'keyboard', key: 'Space', cancel: 'keyup' };
}
for (const key of ['Enter', 'Space'] as const) {
    cases[`descendant-${key.toLowerCase()}`] = { host: 'div', action: 'descendant', key };
    cases[`modified-${key.toLowerCase()}`] = { host: 'span', action: 'keyboard', key, modified: true };
    for (const host of ['button', 'span'] as const)
        cases[`${host}-repeat-${key.toLowerCase()}`] = { host, action: 'repeat', key };
}
for (const type of ['submit', 'reset'] as const) {
    cases[`form-${type}-pointer`] = { host: 'button', action: 'pointer', type };
    for (const key of ['Enter', 'Space'] as const)
        cases[`form-${type}-${key.toLowerCase()}`] = { host: 'button', action: 'keyboard', key, type };
}
for (const host of ['button', 'span', 'link'] as const)
    cases[`${host}-prevent-click`] = { host, action: 'pointer', cancel: 'click' };
cases['span-prevent-space-keydown'] = { host: 'span', action: 'keyboard', key: 'Space', cancel: 'keydown' };
for (const host of ['button', 'span'] as const)
    cases[`${host}-space-focus-leaves`] = { host, action: 'blur', key: 'Space' };
Object.assign(cases, interactionCases);
Object.assign(cases, authoredCases);
Object.assign(cases, toggleCases);

export interface Click {
    target: string | null;
    trusted: boolean;
    detail: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
    prevented: boolean;
}
export interface Probe {
    framework: 'angular' | 'react';
    reference: { commit: string; packageVersion: string; digest: string };
    settings: Settings;
    clicks: Click[];
    submits: (string | null)[];
    resets: number;
    nativeEvents: Record<string, unknown>[];
    handlers: string[];
}
declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        buttonParity: Probe;
    }
}
export function config(): Settings {
    const name = new URLSearchParams(location.search).get('case') ?? 'button-enter';
    if (!Object.hasOwn(cases, name)) throw new Error(`Unknown Button case: ${name}`);
    return cases[name];
}
export function installProbe(framework: Probe['framework'], settings: Settings) {
    const probe: Probe = {
        framework,
        reference: __PARITY_REFERENCE__,
        settings,
        clicks: [],
        submits: [],
        resets: 0,
        nativeEvents: [],
        handlers: []
    };
    window.buttonParity = probe;
    for (const type of ['keydown', 'keyup', 'click', 'pointerdown', 'pointerup', 'focusin']) {
        for (const capture of [true, false]) {
            document.addEventListener(
                type,
                (event) => {
                    if (!(event.target as Element | null)?.closest('[data-testid="subject"]')) return;
                    if (capture && type === settings.cancel) event.preventDefault();
                    probe.nativeEvents.push({
                        type,
                        capture,
                        trusted: event.isTrusted,
                        prevented: event.defaultPrevented,
                        target: (event.target as Element).getAttribute('data-testid'),
                        ...('key' in event
                            ? { key: (event as KeyboardEvent).key, repeat: (event as KeyboardEvent).repeat }
                            : {})
                    });
                },
                capture
            );
        }
    }
    return {
        probe,
        click(event: MouseEvent) {
            if (settings.interaction?.scope === 'standalone' || settings.interaction?.disabledHandlers)
                probe.handlers.push('click');
            probe.clicks.push({
                target: (event.target as Element).getAttribute('data-testid'),
                trusted: event.isTrusted,
                detail: event.detail,
                prevented: event.defaultPrevented,
                shift: event.shiftKey,
                ctrl: event.ctrlKey,
                alt: event.altKey,
                meta: event.metaKey
            });
        },
        submit(event: Event) {
            event.preventDefault();
            probe.submits.push((event as SubmitEvent).submitter?.getAttribute('data-testid') ?? null);
        },
        reset() {
            probe.resets++;
        },
        consume(event: ConsumerKey) {
            if (
                !(
                    settings.interaction?.disabledHandlers ? ['Enter', ' ', 'Tab', 'ArrowRight'] : ['Enter', ' ']
                ).includes(event.key)
            )
                return;
            probe.handlers.push(`${event.type}:${event.key === ' ' ? 'Space' : event.key}`);
            if (settings.interaction?.cancel === event.type) event.preventDefault();
            if (settings.interaction?.stop) event.stopPropagation();
        }
    };
}
export const classes = {
    button: 'border-border inline-flex min-h-9 items-center rounded border px-3 py-2',
    form: 'my-3 flex items-center gap-3'
};
