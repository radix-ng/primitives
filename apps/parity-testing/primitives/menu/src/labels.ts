export const labelCases = [
    'label-group-generated',
    'label-radio-generated',
    'label-group-authored',
    'label-radio-authored',
    'label-group-replace',
    'label-radio-replace'
] as const;

export function labelConfig(name: string) {
    if (!(labelCases as readonly string[]).includes(name)) return undefined;
    return {
        radio: name.includes('-radio-'),
        generated: name.endsWith('-generated'),
        replace: name.endsWith('-replace')
    };
}
