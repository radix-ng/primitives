import { isDeepStrictEqual } from 'node:util';

export interface Checkpoint {
    name: string;
    state: object;
}
export interface Difference {
    checkpoint: string | number;
    field?: string;
    angular: unknown;
    react: unknown;
}
export interface ExpectedDifference extends Difference {
    browser?: string;
    scenario: string;
    checkpoint: string;
    field: string;
    category: string;
    angularAlternatives?: unknown[];
}
export interface RecordedDifference extends Difference {
    category: string;
}

/** Exact, reviewed exception pairs. A changed OR disappeared difference requires review. */
export function compareObservations(
    scenario: string,
    angular: Checkpoint[],
    react: Checkpoint[],
    expected: ExpectedDifference[],
    browser?: string
) {
    const differences: RecordedDifference[] = [];
    const unexpected: Difference[] = [];
    const stale: ExpectedDifference[] = [];
    const relevant = expected.filter(
        (entry) => entry.scenario === scenario && (!entry.browser || entry.browser === browser)
    );
    const used = new Set<ExpectedDifference>();
    for (let index = 0; index < Math.max(angular.length, react.length); index++) {
        const a = angular[index];
        const b = react[index];
        if (!a || !b || a.name !== b.name) {
            unexpected.push({ checkpoint: index, angular: a?.name ?? null, react: b?.name ?? null });
            continue;
        }
        const aState = a.state as Record<string, unknown>;
        const bState = b.state as Record<string, unknown>;
        for (const field of new Set([...Object.keys(aState), ...Object.keys(bState)])) {
            if (isDeepStrictEqual(aState[field], bState[field])) continue;
            const difference = { checkpoint: a.name, field, angular: aState[field], react: bState[field] };
            const exception = relevant.find((entry) => entry.checkpoint === a.name && entry.field === field);
            const matches =
                exception &&
                (isDeepStrictEqual(exception.angular, difference.angular) ||
                    exception.angularAlternatives?.some((value) => isDeepStrictEqual(value, difference.angular))) &&
                isDeepStrictEqual(exception.react, difference.react);
            differences.push({ ...difference, category: matches ? exception.category : 'unexpected' });
            if (matches) used.add(exception);
            else unexpected.push(difference);
        }
    }
    for (const exception of relevant) {
        if (!used.has(exception)) stale.push(exception);
    }
    return { differences, unexpected, stale };
}
