import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ExpectedDifference } from './compare.ts';
import { validateExpectedDifferences } from './validate-differences.ts';

const difference: ExpectedDifference = {
    scenario: 'open',
    checkpoint: 'opened',
    field: 'focus',
    angular: 'popup',
    react: 'field',
    category: 'focus-policy'
};

test('allows distinct engine-specific pairs', () => {
    validateExpectedDifferences(
        [
            { ...difference, browser: 'chromium' },
            { ...difference, browser: 'webkit' }
        ],
        ['open']
    );
});
test('rejects duplicate and overlapping generic/engine exceptions', () => {
    assert.throws(() => validateExpectedDifferences([difference, difference], ['open']), /Duplicate/);
    assert.throws(
        () => validateExpectedDifferences([difference, { ...difference, browser: 'webkit' }], ['open']),
        /Overlapping/
    );
});
test('rejects a missing scenario or an unknown browser', () => {
    assert.throws(() => validateExpectedDifferences([difference], []), /missing scenario/);
    assert.throws(() => validateExpectedDifferences([{ ...difference, browser: 'safari' }], ['open']), /Unknown/);
});

test('allows distinct native platforms but rejects intersecting or unknown platform scopes', () => {
    validateExpectedDifferences(
        [
            { ...difference, browser: 'webkit', platform: 'darwin' },
            { ...difference, browser: 'webkit', platform: 'linux' }
        ],
        ['open']
    );
    assert.throws(
        () =>
            validateExpectedDifferences(
                [
                    { ...difference, platform: 'linux' },
                    { ...difference, browser: 'webkit' }
                ],
                ['open']
            ),
        /Overlapping/
    );
    assert.throws(() => validateExpectedDifferences([{ ...difference, platform: 'other' }], ['open']), /Unknown/);
});
