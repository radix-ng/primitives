import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareObservations, type ExpectedDifference } from './compare.ts';

const angular: { name: string; state: Record<string, unknown> }[] = [
    { name: 'opened', state: { focus: 'popup', label: 'Apple', events: [] } }
];
const react = [{ name: 'opened', state: { focus: 'option:apple', label: 'Apple', events: [] } }];
const expected: ExpectedDifference[] = [
    {
        scenario: 'keyboard',
        checkpoint: 'opened',
        field: 'focus',
        angular: 'popup',
        react: 'option:apple',
        category: 'dom-focus'
    }
];

test('a known focus difference cannot hide changed labels, events, focus targets or other scenarios', () => {
    assert.equal(compareObservations('keyboard', angular, react, expected).unexpected.length, 0);
    const changes: [string, unknown][] = [
        ['label', 'Banana'],
        ['events', [{ type: 'complete', open: false }]],
        ['focus', 'body']
    ];
    for (const [field, value] of changes) {
        const changed = structuredClone(angular);
        changed[0].state[field] = value;
        assert.ok(
            compareObservations('keyboard', changed, react, expected).unexpected.some((entry) => entry.field === field)
        );
    }
    assert.equal(compareObservations('other scenario', angular, react, expected).unexpected.length, 1);
});

test('disappeared exceptions and missing/reordered checkpoints require review', () => {
    assert.equal(compareObservations('keyboard', angular, angular, expected).stale.length, 1);
    assert.equal(compareObservations('keyboard', [], react, expected).unexpected.length, 1);
    assert.equal(
        compareObservations('keyboard', angular, [{ ...react[0], name: 'closed' }], expected).unexpected.length,
        1
    );
});

test('an engine-specific exception cannot hide a difference in another engine', () => {
    const scoped = expected.map((entry) => ({ ...entry, browser: 'chromium' }));
    assert.equal(compareObservations('keyboard', angular, react, scoped, 'chromium').unexpected.length, 0);
    assert.equal(compareObservations('keyboard', angular, react, scoped, 'webkit').unexpected.length, 1);
    assert.equal(compareObservations('keyboard', angular, angular, scoped, 'webkit').stale.length, 0);
    assert.equal(compareObservations('keyboard', angular, angular, scoped, 'chromium').stale.length, 1);
});

test('native platform exceptions remain exact and do not suppress other platforms', () => {
    const scoped = expected.map((entry) => ({ ...entry, browser: 'webkit', platform: 'darwin' }));
    assert.equal(compareObservations('keyboard', angular, react, scoped, 'webkit', 'darwin').unexpected.length, 0);
    assert.equal(compareObservations('keyboard', angular, react, scoped, 'webkit', 'linux').unexpected.length, 1);
    assert.equal(compareObservations('keyboard', angular, angular, scoped, 'webkit', 'linux').stale.length, 0);
    assert.equal(compareObservations('keyboard', angular, angular, scoped, 'webkit', 'darwin').stale.length, 1);
});

test('bounded held-exit focus alternatives reject every unlisted target and changes on the reference side', () => {
    const held = [{ ...expected[0], angular: 'body', angularAlternatives: ['trigger'] }];
    const state = (focus: string) => [{ ...angular[0], state: { ...angular[0].state, focus } }];
    assert.equal(compareObservations('keyboard', state('body'), react, held).unexpected.length, 0);
    assert.equal(compareObservations('keyboard', state('trigger'), react, held).unexpected.length, 0);
    for (const focus of ['popup', 'option:apple', 'other']) {
        const result = compareObservations('keyboard', state(focus), react, held);
        assert.ok(result.unexpected.length + result.stale.length > 0);
    }
    assert.equal(compareObservations('keyboard', state('body'), state('option:banana'), held).unexpected.length, 1);
});
