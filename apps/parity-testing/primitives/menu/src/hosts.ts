export const hostCases = [
    'host-button-enter',
    'host-button-space',
    'host-button-form-default',
    'host-button-form-submit',
    'host-div-enter',
    'host-div-space',
    'host-link-enter',
    'host-link-space',
    'host-item-link-enter',
    'host-item-link-space',
    'host-link-enter-meta',
    'host-link-space-control',
    'host-link-space-shift-alt',
    'host-button-space-control',
    'host-div-enter-shift',
    'host-disabled-button-enter',
    'host-disabled-item-link-enter',
    'host-link-typeahead-space',
    'host-link-typeahead-reopen',
    'host-subtrigger-div-enter',
    'host-subtrigger-div-space',
    'host-subtrigger-button-enter',
    'host-subtrigger-div-disabled'
] as const;
export function hostConfig(name: string) {
    if (!(hostCases as readonly string[]).includes(name)) return undefined;
    return {
        tag: name.includes('link') ? 'a' : name.includes('div') ? 'div' : 'button',
        link: name.startsWith('host-link'),
        disabled: name.includes('disabled'),
        submenu: name.startsWith('host-subtrigger'),
        modified: /meta|control|shift/.test(name),
        form: name.startsWith('host-button-form-'),
        submit: name === 'host-button-form-submit',
        retained: name === 'host-link-typeahead-reopen'
    };
}
export interface HostClick {
    type: string;
    trusted: boolean;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    alt: boolean;
}
