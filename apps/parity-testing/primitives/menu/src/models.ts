export const modelCases = [
    'model-open-explicit-false',
    'model-open-explicit-true',
    'model-open-default',
    'model-open-late-default',
    'model-open-late-after-close',
    'model-open-submenu',
    'model-radio-explicit',
    'model-radio-null',
    'model-radio-undefined',
    'model-radio-default',
    'model-radio-late-default',
    'model-radio-late-after-select'
] as const;

export function modelConfig(name: string) {
    if (!(modelCases as readonly string[]).includes(name)) return undefined;
    const explicitOpen = name.includes('explicit-');
    const initiallyOpen = name === 'model-open-default' || name === 'model-open-late-after-close';
    const explicitRadio = ['model-radio-explicit', 'model-radio-null', 'model-radio-undefined'].includes(name);
    return {
        radio: name.startsWith('model-radio-'),
        nested: name.endsWith('-submenu'),
        explicitOpen,
        open: name.endsWith('explicit-true'),
        defaultOpen: initiallyOpen || name.endsWith('explicit-false'),
        initiallyOpen: initiallyOpen || name.endsWith('explicit-true'),
        late: name.includes('-late-'),
        explicitRadio,
        value: name.endsWith('-null') ? null : name.endsWith('-undefined') ? undefined : 'two',
        defaultValue: name.includes('-late-') ? undefined : 'one'
    };
}
