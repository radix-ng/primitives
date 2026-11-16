import type { Settings } from './contract';

export type ValueKind =
    | 'objects'
    | 'arrays'
    | 'functions'
    | 'symbols'
    | 'bigints'
    | 'booleans'
    | 'falsy'
    | 'mixed'
    | 'null'
    | 'undefined'
    | 'nan'
    | 'signed-zero'
    | 'opaque';
export interface ValueSettings {
    kind: ValueKind;
    controlled?: boolean;
    presence?: boolean;
    missing?: boolean;
    implicit?: boolean;
    cancel?: boolean;
}
const fixture = (values: ValueSettings): Settings => ({ options: [], values });
export const valueCases = {
    'values-objects-default': fixture({ kind: 'objects' }),
    'values-objects-controlled': fixture({ kind: 'objects', controlled: true }),
    'values-arrays-default': fixture({ kind: 'arrays' }),
    'values-arrays-controlled': fixture({ kind: 'arrays', controlled: true }),
    'values-functions-default': fixture({ kind: 'functions' }),
    'values-functions-controlled': fixture({ kind: 'functions', controlled: true }),
    'values-symbols-default': fixture({ kind: 'symbols' }),
    'values-symbols-controlled': fixture({ kind: 'symbols', controlled: true }),
    'values-bigints-default': fixture({ kind: 'bigints' }),
    'values-bigints-controlled': fixture({ kind: 'bigints', controlled: true }),
    'values-booleans-default': fixture({ kind: 'booleans' }),
    'values-booleans-controlled': fixture({ kind: 'booleans', controlled: true }),
    'values-falsy-default': fixture({ kind: 'falsy' }),
    'values-falsy-controlled': fixture({ kind: 'falsy', controlled: true }),
    'values-mixed-default': fixture({ kind: 'mixed' }),
    'values-mixed-controlled': fixture({ kind: 'mixed', controlled: true }),
    'values-null-default': fixture({ kind: 'null' }),
    'values-null-controlled': fixture({ kind: 'null', controlled: true }),
    'values-undefined-default': fixture({ kind: 'undefined' }),
    'values-undefined-canceled-controlled': fixture({ kind: 'undefined', controlled: true, cancel: true }),
    'values-undefined-presence': fixture({ kind: 'undefined', presence: true }),
    'values-nan-canceled': fixture({ kind: 'nan', cancel: true }),
    'values-signed-zero': fixture({ kind: 'signed-zero' }),
    'values-opaque-default': fixture({ kind: 'opaque' }),
    'values-opaque-controlled': fixture({ kind: 'opaque', controlled: true }),
    'values-objects-missing-default': fixture({ kind: 'objects', missing: true }),
    'values-objects-missing-controlled': fixture({ kind: 'objects', missing: true, controlled: true }),
    'values-functions-implicit': fixture({ kind: 'functions', implicit: true }),
    'values-objects-presence': fixture({ kind: 'objects', presence: true }),
    'values-functions-presence': fixture({ kind: 'functions', presence: true })
};
export type ValueCaseName = keyof typeof valueCases;

export function createValues(settings: ValueSettings) {
    let calls = 0;
    let coercions = 0;
    const fn = () => {
        calls++;
        return 'called';
    };
    const opaque = () => ({
        [Symbol.toPrimitive]() {
            coercions++;
            throw new Error('Tab value was coerced');
        }
    });
    const domain: Record<ValueKind, unknown[]> = {
        objects: [{ id: 1 }, { id: 1 }, { id: 2 }],
        arrays: [[1], [1], [2]],
        functions: [fn.bind(null), fn.bind(null), fn.bind(null)],
        symbols: [Symbol('same'), Symbol('same'), Symbol('last')],
        bigints: [1n, 2n, 3n],
        booleans: [false, true, 'last'],
        falsy: [false, 0, ''],
        mixed: [1n, 1, '1'],
        null: [0, null, 'last'],
        undefined: [0, undefined, 'last'],
        nan: [0, NaN, 'last'],
        'signed-zero': [0, 1, 'last'],
        opaque: [opaque(), opaque(), opaque()]
    };
    const options = domain[settings.kind].map((value, index) => ({ key: ['first', 'second', 'third'][index], value }));
    const initial = settings.missing
        ? { id: 1 }
        : settings.implicit
          ? undefined
          : settings.kind === 'signed-zero'
            ? -0
            : options[0].value;
    return { options, initial, counters: () => ({ calls, coercions }) };
}

export interface ValueProbe {
    catalog: ReturnType<typeof createValues>;
}
declare global {
    interface Window {
        tabsValues: ValueProbe;
    }
}
