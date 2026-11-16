import type { Settings } from './contract';

export type CollectionKind =
    | 'remove-selected'
    | 'remove-last'
    | 'empty-refill'
    | 'empty-new-values'
    | 'initial-empty'
    | 'initial-empty-missing'
    | 'implicit-empty'
    | 'initial-all-disabled'
    | 'replace-empty'
    | 'replace-populated'
    | 'unmount-list'
    | 'unmount-empty'
    | 'remove-unselected'
    | 'reorder'
    | 'replace-selected'
    | 'replace-values'
    | 'disable-selected'
    | 'all-disabled'
    | 'disabled-default'
    | 'honor-disabled'
    | 'native-remove';
export interface CollectionSettings {
    kind: CollectionKind;
    controlled?: boolean;
    focus?: 'selected' | 'last' | 'first';
    cancelAutomatic?: boolean;
    cancelRequests?: boolean;
    activateOnFocus?: boolean;
    implicit?: boolean;
    orientation?: 'horizontal' | 'vertical';
    dir?: 'ltr' | 'rtl';
    presence?: boolean;
}
const fixture = (collection: CollectionSettings): Settings => ({ options: [], collection });
export const collectionCases = {
    'collection-remove-selected': fixture({ kind: 'remove-selected' }),
    'collection-remove-selected-focus': fixture({ kind: 'remove-selected', focus: 'selected' }),
    'collection-remove-selected-cancel': fixture({ kind: 'remove-selected', cancelAutomatic: true }),
    'collection-remove-selected-presence': fixture({ kind: 'remove-selected', presence: true }),
    'collection-remove-last': fixture({ kind: 'remove-last', focus: 'selected' }),
    'collection-empty-refill': fixture({ kind: 'empty-refill' }),
    'collection-empty-new-values': fixture({ kind: 'empty-new-values' }),
    'collection-initial-empty': fixture({ kind: 'initial-empty' }),
    'collection-initial-empty-missing': fixture({ kind: 'initial-empty-missing' }),
    'collection-implicit-empty': fixture({ kind: 'implicit-empty', implicit: true }),
    'collection-delayed-all-disabled': fixture({ kind: 'initial-all-disabled', implicit: true, cancelAutomatic: true }),
    'collection-replace-empty-list': fixture({ kind: 'replace-empty' }),
    'collection-replace-populated-list': fixture({ kind: 'replace-populated' }),
    'collection-unmount-list': fixture({ kind: 'unmount-list' }),
    'collection-unmount-list-focus': fixture({ kind: 'unmount-list', focus: 'selected' }),
    'collection-unmount-empty-list': fixture({ kind: 'unmount-empty' }),
    'collection-remove-unselected': fixture({ kind: 'remove-unselected' }),
    'collection-remove-before-focused': fixture({ kind: 'remove-unselected', focus: 'last' }),
    'collection-remove-focused-unselected': fixture({ kind: 'remove-unselected', focus: 'first' }),
    'collection-reorder-focused': fixture({ kind: 'reorder', focus: 'last' }),
    'collection-reorder-automatic': fixture({ kind: 'reorder', focus: 'last', activateOnFocus: true }),
    'collection-reorder-canceled-automatic': fixture({
        kind: 'reorder',
        focus: 'last',
        activateOnFocus: true,
        cancelRequests: true
    }),
    'collection-reorder-vertical-rtl': fixture({ kind: 'reorder', focus: 'last', orientation: 'vertical', dir: 'rtl' }),
    'collection-replace-selected-element': fixture({ kind: 'replace-selected', focus: 'selected' }),
    'collection-replace-values': fixture({ kind: 'replace-values' }),
    'collection-disable-selected': fixture({ kind: 'disable-selected' }),
    'collection-disable-selected-focus': fixture({ kind: 'disable-selected', focus: 'selected' }),
    'collection-disable-auto-focus': fixture({ kind: 'disable-selected', focus: 'selected', activateOnFocus: true }),
    'collection-disable-all-reenable': fixture({ kind: 'all-disabled' }),
    'collection-disable-all-cancel': fixture({ kind: 'all-disabled', cancelAutomatic: true }),
    'collection-explicit-disabled-default': fixture({ kind: 'disabled-default' }),
    'collection-honor-disabled-default': fixture({ kind: 'honor-disabled' }),
    'collection-controlled-remove': fixture({ kind: 'remove-selected', controlled: true }),
    'collection-controlled-empty': fixture({ kind: 'empty-refill', controlled: true }),
    'collection-controlled-all-disabled': fixture({ kind: 'all-disabled', controlled: true }),
    'collection-remove-after-native-request': fixture({ kind: 'native-remove' })
};
export type CollectionCaseName = keyof typeof collectionCases;
export const panelValues = [0, 1, 2, 3, 4, 5];

export function collectionModel(settings: CollectionSettings, step: number) {
    const kind = settings.kind;
    let values = kind === 'remove-last' ? [1] : [0, 1, 2];
    if (['initial-empty', 'initial-empty-missing', 'implicit-empty', 'initial-all-disabled'].includes(kind)) {
        values =
            step === 1 ? (kind === 'initial-empty-missing' || kind === 'implicit-empty' ? [3, 4, 5] : [0, 1, 2]) : [];
    } else if (step === 1) {
        if (kind === 'remove-selected' || kind === 'remove-last') values = values.filter((value) => value !== 1);
        if (kind === 'native-remove') values = values.filter((value) => value !== 2);
        if (['empty-refill', 'empty-new-values', 'replace-empty'].includes(kind)) values = [];
        if (kind === 'remove-unselected') values = [1, 2];
        if (kind === 'reorder') values = [2, 0, 1];
        if (kind === 'replace-values') values = [3, 4, 5];
    }
    if (step === 2 && kind === 'empty-new-values') values = [3, 4, 5];
    if (step === 2 && kind === 'unmount-empty') values = [];
    const options = values.map((value) => ({
        value,
        key: kind === 'replace-selected' && step > 0 && value === 1 ? 'replacement' : String(value),
        disabled:
            (kind === 'disable-selected' && step === 1 && value === 1) ||
            (kind === 'all-disabled' && step === 1) ||
            (kind === 'initial-all-disabled' && step === 1) ||
            (kind === 'disabled-default' && step !== 1 && value === 1) ||
            (kind === 'honor-disabled' &&
                (step === 0 ||
                    (step === 1 && value !== 0) ||
                    (step === 2 && value === 2) ||
                    (step === 3 && value !== 0)))
    }));
    return {
        options,
        showList: !(kind.startsWith('unmount-') && step === 1),
        listKey:
            kind.startsWith('replace-') && (kind === 'replace-empty' || kind === 'replace-populated') && step > 0
                ? 'new-list'
                : 'initial-list',
        dir: settings.dir ?? 'ltr',
        orientation: settings.orientation ?? 'horizontal',
        listClass: 'relative flex min-h-12 gap-2 ' + (settings.orientation === 'vertical' ? 'flex-col' : '')
    };
}
