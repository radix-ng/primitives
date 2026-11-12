export const multiTriggerCases = [
    'multi-inline-pointer',
    'multi-inline-keyboard',
    'multi-detached-pointer',
    'multi-detached-keyboard',
    'multi-cancel-open',
    'multi-cancel-switch',
    'multi-cancel-close',
    'multi-disabled-trigger',
    'multi-payload-update',
    'multi-handle-open',
    'multi-handle-close',
    'multi-controlled-open',
    'multi-controlled-switch',
    'multi-default-open',
    'multi-remove-active',
    'multi-replace-root',
    'multi-retained-reopen',
    'multi-animated-switch'
] as const;

export function multiTriggerConfig(name: string) {
    if (!(multiTriggerCases as readonly string[]).includes(name)) return undefined;
    return {
        detached: !name.startsWith('multi-inline-'),
        controlled: name.startsWith('multi-controlled-'),
        defaultOpen: name === 'multi-default-open',
        retained: name === 'multi-retained-reopen',
        animated: name === 'multi-animated-switch',
        disabled: name === 'multi-disabled-trigger',
        cancelOpen: name === 'multi-cancel-open',
        cancelSwitch: name === 'multi-cancel-switch',
        cancelClose: name === 'multi-cancel-close'
    };
}

export const multiTriggerContent = {
    primary: { label: 'Alpha', items: ['Alpha action', 'Alpha more'] },
    secondary: { label: 'Bravo', items: ['Bravo action', 'Bravo more', 'Bravo extra'] }
};
