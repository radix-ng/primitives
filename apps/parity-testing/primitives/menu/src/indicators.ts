import { exitClass, heldExitClass } from '../../../shared/lifecycle';

export const indicatorCases = [
    'checkbox-indicator',
    'checkbox-indicator-keep',
    'checkbox-indicator-css',
    'checkbox-indicator-css-keep',
    'checkbox-indicator-natural',
    'radio-indicator',
    'radio-indicator-keep',
    'radio-indicator-css',
    'radio-indicator-css-keep',
    'radio-indicator-natural'
] as const;

export function indicatorConfig(name: string) {
    if (!(indicatorCases as readonly string[]).includes(name)) return undefined;
    const animated = name.includes('-css');
    return {
        radio: name.startsWith('radio-'),
        retained: name.endsWith('-keep'),
        animated,
        natural: name.endsWith('-natural'),
        className: `inline-block${animated ? heldExitClass : name.endsWith('-natural') ? exitClass : ''}`
    };
}
