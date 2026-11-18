export type ActivationHost = 'button' | 'span' | 'link' | 'anchor';
export interface ActivationSettings {
    host: ActivationHost;
    action:
        | 'repeat'
        | 'blur'
        | 'prevent'
        | 'stop'
        | 'pointer'
        | 'child-click'
        | 'child-key'
        | 'disable-held'
        | 'form'
        | 'modified'
        | 'navigation';
    key?: 'Enter' | 'Space';
    event?: 'keydown' | 'keyup' | 'click' | 'pointerdown';
    binding?: 'template' | 'native';
    owner?: 'root' | 'item' | 'trigger';
    type?: 'submit' | 'reset';
}
export const activationCases: Record<string, { activation: ActivationSettings }> = {};
for (const host of ['button', 'span', 'link', 'anchor'] as const) {
    const add = (name: string, options: Omit<ActivationSettings, 'host'>) => {
        activationCases[`activation-${host}-${name}`] = { activation: { host, ...options } };
    };
    for (const key of ['Enter', 'Space'] as const) {
        add(`repeat-${key.toLowerCase()}`, { action: 'repeat', key });
        add(`stop-${key.toLowerCase()}`, { action: 'stop', key, event: 'keydown' });
    }
    add('space-blur', { action: 'blur', key: 'Space' });
    add('navigation', { action: 'navigation' });
    for (const binding of ['template', 'native'] as const) {
        add(`${binding}-prevent-enter-down`, { action: 'prevent', binding, key: 'Enter', event: 'keydown' });
        add(`${binding}-prevent-space-down`, { action: 'prevent', binding, key: 'Space', event: 'keydown' });
        add(`${binding}-prevent-space-up`, { action: 'prevent', binding, key: 'Space', event: 'keyup' });
        add(`${binding}-prevent-click`, { action: 'prevent', binding, event: 'click' });
    }
    add('stop-click', { action: 'stop', event: 'click' });
    add('prevent-pointer-down', { action: 'pointer', event: 'pointerdown' });
    add('child-click', { action: 'child-click' });
    for (const owner of ['root', 'item', 'trigger'] as const) {
        add(`disable-${owner}-while-held`, { action: 'disable-held', key: 'Space', owner });
    }
}
for (const key of ['Enter', 'Space'] as const) {
    activationCases[`activation-span-child-${key.toLowerCase()}`] = {
        activation: { host: 'span', action: 'child-key', key }
    };
    for (const host of ['span', 'anchor'] as const) {
        activationCases[`activation-${host}-modified-${key.toLowerCase()}`] = {
            activation: { host, action: 'modified', key }
        };
    }
}
for (const type of ['submit', 'reset'] as const) {
    for (const key of [undefined, 'Enter', 'Space'] as const) {
        activationCases[`activation-form-${type}-${key?.toLowerCase() ?? 'pointer'}`] = {
            activation: { host: 'button', action: 'form', type, key }
        };
    }
}
