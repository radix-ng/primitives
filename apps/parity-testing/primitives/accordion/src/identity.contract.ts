export const identityKinds = [
    'object',
    'function',
    'array',
    'symbol',
    'primitive',
    'primitive-types',
    'shared',
    'duplicates',
    'fallback',
    'controlled',
    'replace',
    'collection',
    'fallback-recreate',
    'mode',
    'nan'
] as const;
export type IdentityKind = (typeof identityKinds)[number];
export interface IdentityRow {
    id: string;
    value?: unknown;
}

export const frozenSelection = (values: unknown[]): unknown[] => Object.freeze(values) as unknown[];

/** Fixture inputs and lossless reference labels only; Accordion owns selection in each framework. */
export function identityValues(kind: IdentityKind, multiple: boolean) {
    const object = Object.freeze({ label: 'same' });
    const clone = Object.freeze({ label: 'same' });
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    Object.freeze(circular);
    const valueFunction = () => () => {
        throw new Error('An Accordion item value must not be invoked');
    };
    const pools: Partial<Record<IdentityKind, Record<string, unknown>>> = {
        object: { a: object, b: clone, c: circular },
        function: { a: valueFunction(), b: valueFunction(), c: valueFunction() },
        array: { a: Object.freeze(['nested']), b: Object.freeze(['nested']), c: Object.freeze([]) },
        symbol: { a: Symbol('same'), b: Symbol('same'), c: Symbol.for('accordion-parity') },
        primitive: { a: 0, b: false, c: '' },
        'primitive-types': { a: 1, b: '1', c: 1n, d: Infinity },
        shared: { a: object, b: object, c: clone },
        fallback: { a: undefined, b: null },
        'fallback-recreate': { a: undefined, b: null },
        nan: { a: NaN, b: -0, c: 0 }
    };
    const pool = pools[kind] ?? { a: object, b: clone, c: circular };
    const replacement = Object.freeze({ label: 'same' });
    const orphan = Object.freeze({ label: 'same' });
    const entries = [...Object.entries(pool), ['replacement', replacement], ['orphan', orphan]] as [string, unknown][];
    const generated: string[] = [];
    const row = (id: string): IdentityRow => ({ id, value: pool[id] });
    const rows = Object.keys(pool).map(row);
    if (['controlled', 'replace', 'collection', 'mode', 'duplicates'].includes(kind)) rows.splice(2);
    const initial = frozenSelection(
        kind === 'duplicates'
            ? [pool.a, pool.a, pool.b]
            : kind === 'mode' || (kind === 'collection' && multiple)
              ? [pool.a, pool.b]
              : ['controlled', 'replace', 'collection'].includes(kind)
                ? [pool.a]
                : []
    );
    const labels = (values: readonly unknown[]) =>
        values.map((value) => {
            const entry = entries.find(([, candidate]) => Object.is(candidate, value));
            if (entry) return entry[0];
            if (!['fallback', 'fallback-recreate'].includes(kind) || typeof value !== 'string') {
                throw new Error(`Unregistered Accordion value (${typeof value}); reference identity was lost`);
            }
            let index = generated.indexOf(value);
            if (index === -1) {
                index = generated.length;
                generated.push(value);
            }
            return `generated:${index + 1}`;
        });
    return { pool, replacement, orphan, row, rows, initial, labels };
}
