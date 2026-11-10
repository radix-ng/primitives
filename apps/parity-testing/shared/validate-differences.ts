import type { ExpectedDifference } from './compare.ts';

/** Reject ambiguous or orphaned exceptions before either implementation runs. */
export function validateExpectedDifferences(entries: ExpectedDifference[], scenarios: readonly string[]): void {
    const keys = new Set<string>();
    for (const entry of entries) {
        if (entry.browser && !['chromium', 'firefox', 'webkit'].includes(entry.browser))
            throw new Error(`Unknown difference browser: ${entry.browser}`);
        if (entry.platform && !['darwin', 'linux', 'win32'].includes(entry.platform))
            throw new Error(`Unknown difference platform: ${entry.platform}`);
        const key = JSON.stringify([entry.scenario, entry.checkpoint, entry.field, entry.browser, entry.platform]);
        if (keys.has(key)) throw new Error(`Duplicate difference: ${key}`);
        if (!scenarios.includes(entry.scenario))
            throw new Error(`Difference refers to a missing scenario: ${entry.scenario}`);
        keys.add(key);
    }
    for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];
        if (
            entries
                .slice(index + 1)
                .some(
                    (other) =>
                        other.scenario === entry.scenario &&
                        other.checkpoint === entry.checkpoint &&
                        other.field === entry.field &&
                        (!other.browser || !entry.browser || other.browser === entry.browser) &&
                        (!other.platform || !entry.platform || other.platform === entry.platform)
                )
        )
            throw new Error(`Overlapping browser/platform difference: ${JSON.stringify(entry)}`);
    }
}
