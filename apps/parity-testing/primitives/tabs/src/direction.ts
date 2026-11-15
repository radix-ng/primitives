import type { Settings } from './contract';

export interface DirectionSettings {
    orientation: 'horizontal' | 'vertical';
    dir: 'ltr' | 'rtl';
    kind?:
        | 'null'
        | 'cancel'
        | 'insert-number'
        | 'insert-string'
        | 'equal'
        | 'focus-inside'
        | 'focus-outside'
        | 'fallback'
        | 'missing'
        | 'initial-missing';
}
const fixture = (direction: DirectionSettings): Settings => ({
    options:
        direction.kind === 'insert-number'
            ? [
                  { value: 1, label: 'Overview' },
                  { value: 2, label: 'Projects' }
              ]
            : [
                  { value: 'Overview', label: 'Overview' },
                  { value: 'Projects', label: 'Projects' }
              ],
    value: direction.kind === 'initial-missing' ? 'Missing' : undefined,
    direction
});
export const directionCases = {
    'direction-horizontal-ltr': fixture({ orientation: 'horizontal', dir: 'ltr' }),
    'direction-horizontal-rtl': fixture({ orientation: 'horizontal', dir: 'rtl' }),
    'direction-vertical-ltr': fixture({ orientation: 'vertical', dir: 'ltr' }),
    'direction-vertical-rtl': fixture({ orientation: 'vertical', dir: 'rtl' }),
    'direction-null-horizontal': fixture({ orientation: 'horizontal', dir: 'ltr', kind: 'null' }),
    'direction-null-vertical': fixture({ orientation: 'vertical', dir: 'ltr', kind: 'null' }),
    'direction-cancel-external': fixture({ orientation: 'horizontal', dir: 'ltr', kind: 'cancel' }),
    'direction-insert-number': fixture({ orientation: 'horizontal', dir: 'ltr', kind: 'insert-number' }),
    'direction-insert-string': fixture({ orientation: 'horizontal', dir: 'ltr', kind: 'insert-string' }),
    'direction-insert-string-rtl': fixture({ orientation: 'horizontal', dir: 'rtl', kind: 'insert-string' }),
    'direction-insert-vertical': fixture({ orientation: 'vertical', dir: 'ltr', kind: 'insert-string' }),
    'direction-equal-positions': fixture({ orientation: 'horizontal', dir: 'ltr', kind: 'equal' }),
    'direction-focus-inside': fixture({ orientation: 'horizontal', dir: 'ltr', kind: 'focus-inside' }),
    'direction-focus-outside': fixture({ orientation: 'horizontal', dir: 'ltr', kind: 'focus-outside' }),
    'direction-automatic-fallback': fixture({ orientation: 'horizontal', dir: 'ltr', kind: 'fallback' }),
    'direction-missing-values': fixture({ orientation: 'horizontal', dir: 'ltr', kind: 'missing' }),
    'direction-initial-missing': fixture({ orientation: 'horizontal', dir: 'ltr', kind: 'initial-missing' })
};
export type DirectionCaseName = keyof typeof directionCases;
export const directionListClass = (settings: DirectionSettings) =>
    'relative flex gap-2 ' +
    (settings.orientation === 'vertical' ? 'flex-col ' : '') +
    (settings.kind === 'equal' ? 'h-12 ' : '');
export const directionTabClass = (settings: DirectionSettings) =>
    settings.kind === 'equal' ? ' absolute start-0 top-0' : '';
