import type { Settings } from './contract';

export interface Interaction {
    scope: 'standalone' | 'composite' | 'toolbar';
    cancel?: 'keydown' | 'keyup';
    listener?: 'template' | 'native';
    stop?: boolean;
    repeat?: boolean;
    disabledOwner?: 'group' | 'root';
}
export const interactionCases: Record<string, Settings> = {};
for (const host of ['button', 'span', 'link'] as const) {
    for (const [key, cancel] of [
        ['Enter', 'keydown'],
        ['Space', 'keyup']
    ] as const) {
        interactionCases[`consumer-${host}-${key.toLowerCase()}`] = {
            host,
            action: 'interaction',
            key,
            interaction: { scope: 'standalone', cancel }
        };
    }
}
for (const key of ['Enter', 'Space'] as const) {
    interactionCases[`consumer-order-${key.toLowerCase()}`] = {
        host: 'span',
        action: 'interaction',
        key,
        interaction: { scope: 'standalone' }
    };
    interactionCases[`consumer-native-${key.toLowerCase()}`] = {
        host: 'span',
        action: 'interaction',
        key,
        interaction: { scope: 'standalone', cancel: key === 'Enter' ? 'keydown' : 'keyup', listener: 'native' }
    };
}
interactionCases['consumer-space-prevent-keydown'] = {
    host: 'span',
    action: 'interaction',
    key: 'Space',
    interaction: { scope: 'standalone', cancel: 'keydown' }
};
interactionCases['consumer-stop-enter'] = {
    host: 'span',
    action: 'interaction',
    key: 'Enter',
    interaction: { scope: 'standalone', stop: true }
};
for (const scope of ['composite', 'toolbar'] as const) {
    for (const host of ['button', 'span', 'link'] as const) {
        for (const key of ['Enter', 'Space'] as const) {
            interactionCases[`${scope}-${host}-${key.toLowerCase()}`] = {
                host,
                action: 'interaction',
                key,
                focusableWhenDisabled: true,
                interaction: { scope }
            };
        }
        for (const [key, cancel] of [
            ['Enter', 'keydown'],
            ['Space', 'keydown'],
            ['Space', 'keyup']
        ] as const) {
            interactionCases[`${scope}-${host}-consumer-${key.toLowerCase()}-${cancel}`] = {
                host,
                action: 'interaction',
                key,
                focusableWhenDisabled: true,
                interaction: { scope, cancel }
            };
        }
        if (host !== 'link')
            interactionCases[`${scope}-${host}-modified-space`] = {
                host,
                action: 'interaction',
                key: 'Space',
                modified: true,
                focusableWhenDisabled: true,
                interaction: { scope }
            };
        interactionCases[`${scope}-${host}-repeat-space`] = {
            host,
            action: 'interaction',
            key: 'Space',
            focusableWhenDisabled: true,
            interaction: { scope, repeat: true }
        };
        for (const focusableWhenDisabled of [true, false]) {
            interactionCases[`${scope}-${host}-disabled-${focusableWhenDisabled ? 'focusable' : 'skipped'}`] = {
                host,
                action: 'interaction',
                key: 'Space',
                disabled: true,
                focusableWhenDisabled,
                interaction: { scope }
            };
        }
    }
}
for (const disabledOwner of ['group', 'root'] as const) {
    for (const host of ['button', 'span'] as const)
        interactionCases[`toolbar-${disabledOwner}-disabled-${host}`] = {
            host,
            action: 'interaction',
            key: 'Space',
            focusableWhenDisabled: true,
            interaction: { scope: 'toolbar', disabledOwner }
        };
}
export interface ConsumerKey {
    type: string;
    key: string;
    defaultPrevented: boolean;
    preventDefault(): void;
    stopPropagation(): void;
}
