import type { Settings, Value } from './contract';

export type IndicatorKind =
    | 'horizontal'
    | 'vertical'
    | 'null'
    | 'missing'
    | 'hidden'
    | 'zero-width'
    | 'zero-height'
    | 'resize-active'
    | 'resize-sibling'
    | 'resize-label'
    | 'resize-list'
    | 'resize-vertical'
    | 'replace-tab'
    | 'insert-tab'
    | 'replace-list'
    | 'multiple'
    | 'remount';

const fixture = (indicator: IndicatorKind): Settings => ({ options: [], indicator });
export const indicatorCases = {
    'indicator-horizontal': fixture('horizontal'),
    'indicator-vertical': fixture('vertical'),
    'indicator-null-restore': fixture('null'),
    'indicator-missing-restore': fixture('missing'),
    'indicator-hidden-tab': fixture('hidden'),
    'indicator-zero-width': fixture('zero-width'),
    'indicator-zero-height': fixture('zero-height'),
    'indicator-resize-active': fixture('resize-active'),
    'indicator-resize-sibling': fixture('resize-sibling'),
    'indicator-resize-label': fixture('resize-label'),
    'indicator-resize-list': fixture('resize-list'),
    'indicator-resize-vertical': fixture('resize-vertical'),
    'indicator-replace-tab': fixture('replace-tab'),
    'indicator-insert-tab': fixture('insert-tab'),
    'indicator-replace-list': fixture('replace-list'),
    'indicator-multiple': fixture('multiple'),
    'indicator-remount': fixture('remount')
};
export type IndicatorCaseName = keyof typeof indicatorCases;

export function indicatorModel(kind: IndicatorKind, step: number) {
    const changed = step === 1 || step === 3;
    const vertical = kind === 'vertical' || kind === 'resize-vertical';
    let value: Value = 1;
    if (kind === 'null' && !changed) value = null;
    if (kind === 'missing' && changed) value = 'absent';
    const resized = changed && ['resize-active', 'multiple', 'remount'].includes(kind);
    const tabs = [
        {
            key: 'zero',
            value: 0,
            label: 'Overview',
            className: 'shrink-0 w-20 ' + (kind === 'resize-sibling' && changed ? 'w-38! ' : '') + 'h-8'
        },
        {
            key: kind === 'replace-tab' && step > 0 ? 'replacement' : 'one',
            value: 1,
            label: kind === 'resize-label' && changed ? 'Projects and permissions' : 'Projects',
            className:
                'shrink-0 whitespace-nowrap ' +
                (kind === 'resize-label'
                    ? 'px-4 '
                    : kind === 'zero-width' && !changed
                      ? 'w-0 '
                      : resized || (kind === 'replace-tab' && step > 0)
                        ? 'w-44 '
                        : 'w-28 ') +
                (kind === 'zero-height' && !changed
                    ? 'h-0 '
                    : kind === 'resize-vertical' && changed
                      ? 'h-16 '
                      : 'h-8 ') +
                (kind === 'hidden' && !changed ? 'hidden' : '')
        },
        { key: 'two', value: 2, label: 'Team', className: 'shrink-0 w-16 h-8' }
    ];
    if (kind === 'insert-tab' && changed)
        tabs.unshift({ key: 'inserted', value: 3, label: 'New', className: 'shrink-0 w-12 h-8' });
    return {
        value,
        tabs,
        orientation: vertical ? ('vertical' as const) : ('horizontal' as const),
        listKey: kind === 'replace-list' && step > 0 ? 'replacement' : 'initial',
        listClass:
            'relative flex items-start gap-2 ' +
            (vertical
                ? 'w-48 h-48 flex-col '
                : kind === 'resize-list' && changed
                  ? 'w-112 h-12 '
                  : kind === 'replace-list' && step > 0
                    ? step === 1
                        ? 'w-112 h-12 '
                        : 'w-128 h-12 '
                    : 'w-96 h-12 '),
        indicators: kind === 'remount' && step === 1 ? [] : kind === 'multiple' ? [0, 1] : [0]
    };
}

export const indicatorClass =
    'pointer-events-none absolute left-(--active-tab-left) top-(--active-tab-top) ' +
    'w-(--active-tab-width) h-(--active-tab-height) bg-primary';
