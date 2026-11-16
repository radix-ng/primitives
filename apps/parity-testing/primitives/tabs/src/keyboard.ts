import type { Settings } from './contract';

export interface KeyboardSettings {
    kind?: 'navigation' | 'modifier' | 'tab-order' | 'rapid';
    orientation?: 'horizontal' | 'vertical';
    dir?: 'ltr' | 'rtl';
    automatic?: boolean;
    loop?: boolean;
    disabled?: number[];
    initialNull?: boolean;
    controlled?: 'accept' | 'ignore' | 'delay';
    modifier?: 'Shift' | 'Control' | 'Alt' | 'Meta' | 'Control+Shift';
    presence?: boolean;
    activation?: 'Enter' | 'Space' | 'Arrow';
    backward?: boolean;
    endFocus?: boolean;
}
const fixture = (keyboard: KeyboardSettings): Settings => ({ options: [], keyboard });
export const keyboardCases = {
    'keyboard-h-ltr-manual-loop': fixture({}),
    'keyboard-h-ltr-auto-loop': fixture({ automatic: true }),
    'keyboard-h-rtl-manual-loop': fixture({ dir: 'rtl' }),
    'keyboard-h-rtl-auto-loop': fixture({ dir: 'rtl', automatic: true }),
    'keyboard-v-ltr-manual-loop': fixture({ orientation: 'vertical' }),
    'keyboard-v-ltr-auto-loop': fixture({ orientation: 'vertical', automatic: true }),
    'keyboard-v-rtl-manual-loop': fixture({ orientation: 'vertical', dir: 'rtl' }),
    'keyboard-v-rtl-auto-loop': fixture({ orientation: 'vertical', dir: 'rtl', automatic: true }),
    'keyboard-h-ltr-manual-clamp': fixture({ loop: false }),
    'keyboard-h-ltr-auto-clamp': fixture({ loop: false, automatic: true }),
    'keyboard-h-rtl-manual-clamp': fixture({ loop: false, dir: 'rtl' }),
    'keyboard-h-rtl-auto-clamp': fixture({ loop: false, dir: 'rtl', automatic: true }),
    'keyboard-v-ltr-manual-clamp': fixture({ loop: false, orientation: 'vertical' }),
    'keyboard-v-ltr-auto-clamp': fixture({ loop: false, orientation: 'vertical', automatic: true }),
    'keyboard-v-rtl-manual-clamp': fixture({ loop: false, orientation: 'vertical', dir: 'rtl' }),
    'keyboard-v-rtl-auto-clamp': fixture({ loop: false, orientation: 'vertical', dir: 'rtl', automatic: true }),
    'keyboard-disabled-middle-manual': fixture({ disabled: [2] }),
    'keyboard-disabled-middle-auto': fixture({ disabled: [2], automatic: true }),
    'keyboard-disabled-edges-auto': fixture({ disabled: [0, 3], automatic: true }),
    'keyboard-all-disabled-manual': fixture({ disabled: [0, 1, 2, 3], initialNull: true }),
    'keyboard-all-disabled-auto': fixture({ disabled: [0, 1, 2, 3], initialNull: true, automatic: true }),
    'keyboard-disabled-default-auto': fixture({ disabled: [1], automatic: true }),
    'keyboard-controlled-ignore-auto': fixture({ controlled: 'ignore', automatic: true }),
    'keyboard-controlled-delay-auto': fixture({ controlled: 'delay', automatic: true }),
    'keyboard-controlled-accept-auto': fixture({ controlled: 'accept', automatic: true }),
    'keyboard-controlled-accept-manual': fixture({ controlled: 'accept' }),
    'keyboard-modifier-shift': fixture({
        kind: 'modifier',
        orientation: 'vertical',
        automatic: true,
        modifier: 'Shift'
    }),
    'keyboard-modifier-control': fixture({
        kind: 'modifier',
        orientation: 'vertical',
        automatic: true,
        modifier: 'Control'
    }),
    'keyboard-modifier-alt': fixture({ kind: 'modifier', orientation: 'vertical', automatic: true, modifier: 'Alt' }),
    'keyboard-modifier-meta': fixture({ kind: 'modifier', orientation: 'vertical', automatic: true, modifier: 'Meta' }),
    'keyboard-modifier-combined': fixture({
        kind: 'modifier',
        orientation: 'vertical',
        automatic: true,
        modifier: 'Control+Shift'
    }),
    'keyboard-tab-order-manual': fixture({ kind: 'tab-order' }),
    'keyboard-tab-order-auto': fixture({ kind: 'tab-order', automatic: true }),
    'keyboard-tab-order-disabled-last-manual': fixture({ kind: 'tab-order', disabled: [3], endFocus: true }),
    'keyboard-tab-order-disabled-last-auto': fixture({
        kind: 'tab-order',
        disabled: [3],
        automatic: true,
        endFocus: true
    }),
    'keyboard-tab-order-null': fixture({ kind: 'tab-order', initialNull: true }),
    'keyboard-tab-order-controlled-ignore': fixture({
        kind: 'tab-order',
        controlled: 'ignore',
        automatic: true,
        endFocus: true
    }),
    'keyboard-rapid-enter-retained': fixture({ kind: 'rapid' }),
    'keyboard-rapid-enter-presence': fixture({ kind: 'rapid', presence: true }),
    'keyboard-rapid-enter-controlled': fixture({ kind: 'rapid', controlled: 'accept' }),
    'keyboard-rapid-enter-controlled-presence': fixture({ kind: 'rapid', controlled: 'accept', presence: true }),
    'keyboard-rapid-enter-ignore': fixture({ kind: 'rapid', controlled: 'ignore' }),
    'keyboard-rapid-enter-delay': fixture({ kind: 'rapid', controlled: 'delay' }),
    'keyboard-rapid-space-retained': fixture({ kind: 'rapid', activation: 'Space' }),
    'keyboard-rapid-space-controlled': fixture({ kind: 'rapid', activation: 'Space', controlled: 'accept' }),
    'keyboard-rapid-auto-retained': fixture({ kind: 'rapid', activation: 'Arrow', automatic: true }),
    'keyboard-rapid-auto-controlled': fixture({
        kind: 'rapid',
        activation: 'Arrow',
        automatic: true,
        controlled: 'accept'
    }),
    'keyboard-rapid-enter-backward': fixture({ kind: 'rapid', backward: true }),
    'keyboard-rapid-enter-disabled': fixture({ kind: 'rapid', disabled: [2] }),
    'keyboard-rapid-enter-vertical-rtl': fixture({ kind: 'rapid', orientation: 'vertical', dir: 'rtl' })
};
export type KeyboardCaseName = keyof typeof keyboardCases;
export const keyboardValues = [0, 1, 2, 3];

export interface KeyboardKey {
    key: string;
    target: string;
    shift: boolean;
    control: boolean;
    alt: boolean;
    meta: boolean;
    trusted: boolean;
    prevented: boolean;
    bubbled: boolean;
    time: number;
    selected: string[];
}
export interface KeyboardProbe {
    keys: KeyboardKey[];
    focus: { target: string; trusted: boolean }[];
}
declare global {
    interface Window {
        tabsKeyboard: KeyboardProbe;
    }
}

export function installKeyboardProbe(): void {
    const probe: KeyboardProbe = { keys: [], focus: [] };
    window.tabsKeyboard = probe;
    const records = new WeakMap<KeyboardEvent, KeyboardKey>();
    const target = (element: EventTarget | null) =>
        element instanceof Element ? (element.getAttribute('data-testid') ?? element.tagName) : 'unknown';
    document.addEventListener(
        'keydown',
        (event) => {
            if (
                !['Tab', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(
                    event.key
                )
            )
                return;
            const record: KeyboardKey = {
                key: event.key,
                target: target(event.target),
                shift: event.shiftKey,
                control: event.ctrlKey,
                alt: event.altKey,
                meta: event.metaKey,
                trusted: event.isTrusted,
                // Native dispatch can run microtasks between listeners. Read the final event
                // flag when a checkpoint serializes the record, rather than during capture.
                get prevented() {
                    return event.defaultPrevented;
                },
                bubbled: false,
                time: performance.now(),
                selected: [...document.querySelectorAll<HTMLElement>('[role="tab"][aria-selected="true"]')].map(
                    (tab) => tab.dataset.testid!
                )
            };
            probe.keys.push(record);
            records.set(event, record);
        },
        true
    );
    document.addEventListener('keydown', (event) => {
        const record = records.get(event);
        if (record) record.bubbled = true;
    });
    document.addEventListener(
        'focusin',
        (event) => probe.focus.push({ target: target(event.target), trusted: event.isTrusted }),
        true
    );
}
