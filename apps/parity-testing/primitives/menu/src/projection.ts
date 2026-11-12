export const projectionCases = [
    'projection-keyboard',
    'projection-mixed',
    'projection-typeahead',
    'projection-values',
    'projection-link',
    'projection-reorder',
    'projection-late-items',
    'projection-submenu',
    'projection-submenu-rtl',
    'projection-retained',
    'projection-retained-submenu',
    'projection-focus-cancel',
    'projection-final-target'
] as const;

export function projectionConfig(name: string) {
    if (!(projectionCases as readonly string[]).includes(name)) return undefined;
    return {
        mixed: name === 'projection-mixed',
        values: name === 'projection-values',
        link: name === 'projection-link',
        retained: name.includes('retained'),
        nested: name.includes('submenu'),
        cancelFocus: name === 'projection-focus-cancel',
        finalTarget: name === 'projection-final-target',
        late: name === 'projection-late-items'
    };
}

export const projectionEntries = [
    { id: 'alpha', label: 'Alpha', disabled: false },
    { id: 'blocked', label: 'Bravo disabled', disabled: true },
    { id: 'bravo', label: 'Bravo', disabled: false }
];
