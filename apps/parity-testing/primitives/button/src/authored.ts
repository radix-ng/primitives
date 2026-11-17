import type { Signal, WritableSignal } from '@angular/core';
import type { Settings } from './contract';

export interface Authored {
    scope: 'standalone' | 'composite' | 'toolbar';
    binding: 'static' | 'property';
    action: 'initial' | 'dynamic' | 'disabled' | 'roving' | 'role-space';
    role: string;
    tabIndex: number;
}
export interface AuthoredState {
    role: WritableSignal<string | null | undefined>;
    tabIndex: WritableSignal<number | null | undefined>;
    disabled: WritableSignal<boolean>;
    focusable: WritableSignal<boolean>;
    epoch: Signal<number>;
}
export const authoredCases: Record<string, Settings> = {};
for (const scope of ['standalone', 'composite', 'toolbar'] as const) {
    for (const host of ['button', 'span', 'link'] as const) {
        for (const action of ['initial', 'dynamic', 'disabled'] as const) {
            authoredCases[`authored-${scope}-${host}-${action}`] = {
                host,
                action: 'authored',
                authored: {
                    scope,
                    action,
                    binding: action === 'initial' ? 'static' : 'property',
                    role: 'menuitem',
                    tabIndex: action === 'disabled' ? 3 : -1
                }
            };
        }
        if (scope !== 'standalone')
            authoredCases[`authored-${scope}-${host}-roving`] = {
                host,
                action: 'authored',
                authored: { scope, action: 'roving', binding: 'property', role: 'button', tabIndex: 0 }
            };
    }
}
for (const scope of ['composite', 'toolbar'] as const) {
    for (const host of ['button', 'span'] as const) {
        for (const role of ['menuitem', 'option', 'gridcell']) {
            authoredCases[`authored-${scope}-${host}-${role}-space`] = {
                host,
                action: 'authored',
                authored: { scope, action: 'role-space', binding: 'property', role, tabIndex: -1 }
            };
        }
    }
}
