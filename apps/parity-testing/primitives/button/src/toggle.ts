import type { Settings } from './contract';

export interface ToggleSettings {
    action:
        | 'enter'
        | 'space'
        | 'space-repeat'
        | 'enter-repeat'
        | 'space-modified'
        | 'cancel-change'
        | 'prevent-enter'
        | 'prevent-space'
        | 'pointer';
    stacked?: boolean;
}
export interface ToggleChange {
    pressed: boolean;
    type: string;
    reason: string;
    trusted: boolean;
    shift: boolean;
    ctrl: boolean;
}
export const toggleCases: Record<string, Settings> = {};
for (const host of ['button', 'span'] as const) {
    for (const action of [
        'enter',
        'space',
        'space-repeat',
        'enter-repeat',
        'space-modified',
        'cancel-change',
        'prevent-enter',
        'prevent-space',
        'pointer'
    ] as const) {
        toggleCases[`toggle-toolbar-${host}-${action}`] = { host, action: 'toggle', toggle: { action } };
    }
    for (const action of ['enter', 'space'] as const) {
        toggleCases[`toggle-toolbar-stacked-${host}-${action}`] = {
            host,
            action: 'toggle',
            toggle: { action, stacked: true }
        };
    }
}
