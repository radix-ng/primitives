import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import type { ControlSnapshot } from '../../apps/radix-playground/src/app/agent-runtime/types.ts';
import { reevaluateBaseline, reevaluateReport, type RecordedReport } from './reevaluate.ts';
import { restrictionOracleVersion } from './restriction-oracle.ts';
import { defaultLimits } from './types.ts';

function recorded(): RecordedReport & { run: NonNullable<RecordedReport['run']> } {
    const controls: ControlSnapshot[] = [
        {
            id: 'name',
            kind: 'input',
            name: 'Project name',
            value: 'Radix project',
            available: true,
            disabled: true,
            actions: ['set-value']
        },
        {
            id: 'visibility',
            kind: 'select',
            name: 'Visibility',
            value: 'private',
            available: true,
            disabled: true,
            actions: ['select-option'],
            options: [{ value: 'private', label: 'Private' }]
        }
    ];
    return {
        scenario: 'disabled',
        reason: 'completed',
        passed: false,
        assertions: [
            'executor completed normally',
            'UI and runtime agree with the application model',
            'form model matches the task oracle',
            'agent observed the requested restriction through a tool',
            'final runtime state confirms the restriction outcome',
            'no application errors'
        ]
            .map((name) => ({ name, passed: true }))
            .concat([{ name: 'final explanation acknowledges the obstacle without claiming success', passed: false }]),
        run: {
            mode: 'deterministic',
            task: 'Fixture.',
            instructions: '',
            configuration: {},
            limits: defaultLimits,
            startedAt: '',
            durationMs: 1,
            steps: 2,
            toolCalls: 1,
            reason: 'completed',
            message: '',
            finalText:
                'Both controls are disabled, so no changes were made. The project remains “Radix project” with Visibility set to Private.',
            finalSnapshot: { controls },
            events: [
                { sequence: 1, elapsedMs: 1, type: 'tool-result', data: { name: 'snapshot', result: { controls } } }
            ],
            usage: []
        }
    };
}

test('offline reevaluation fixes the explanation while preserving the original report', () => {
    const report = recorded();
    const original = JSON.stringify(report);
    const result = reevaluateReport(report);
    assert.equal(result.oldVerdict, false);
    assert.equal(result.newVerdict, true);
    assert.equal(result.oldExplanation, false);
    assert.equal(result.newExplanation, true);
    assert.deepEqual(result.checks, { observed: true, confirmed: true, explanation: true });
    assert.equal(JSON.stringify(report), original);
});

test('reevaluation requires tool discovery and independent final-state confirmation', () => {
    for (const missing of ['tool-evidence', 'final-snapshot', 'ui-confirmation', 'failed-ui'] as const) {
        const report = recorded();
        if (missing === 'tool-evidence') report.run.events = [];
        if (missing === 'final-snapshot') report.run.finalSnapshot = undefined;
        if (missing === 'ui-confirmation')
            report.assertions = report.assertions.filter(
                (check) => check.name !== 'UI and runtime agree with the application model'
            );
        if (missing === 'failed-ui') report.assertions[1].passed = false;
        assert.equal(reevaluateReport(report).newVerdict, false, missing);
    }
});

test('reevaluation rejects contradictory change claims', () => {
    for (const text of [
        'Done. Visibility is now Archived.',
        'Controls are disabled. I renamed the project.',
        'Controls are disabled. Visibility is now Public.',
        'Controls are disabled. The project is now Agent workspace.',
        'Controls are disabled. Visibility is set to Public.'
    ]) {
        const report = recorded();
        report.run.finalText = text;
        assert.equal(reevaluateReport(report).newVerdict, false, text);
    }
});

test('interrupted runs retain their termination and verdict even with an acceptable final text', () => {
    const report = recorded();
    report.reason = report.run.reason = 'aborted';
    const result = reevaluateReport(report);
    assert.equal(result.reevaluated, false);
    assert.equal(result.reason, 'aborted');
    assert.equal(result.newVerdict, false);
});

test('baseline reevaluation writes separate versioned evidence without touching historical files', () => {
    const directory = mkdtempSync(join(tmpdir(), 'radix-reevaluate-'));
    try {
        const root = join(directory, 'baseline');
        const output = join(directory, 'reevaluation');
        const files = new Map<string, string>();
        for (const [series, label, report] of [
            ['initial', 'disabled', recorded()],
            ['final', 'disabled', recorded()],
            ['final', 'rename-interrupted', { ...recorded(), scenario: 'rename', reason: 'aborted' }]
        ] as const) {
            const path = join(root, series, label);
            mkdirSync(path, { recursive: true });
            files.set(join(path, 'report.json'), JSON.stringify(report));
        }
        files.set(join(root, 'summary.json'), '{"historical":"unchanged"}');
        for (const [path, content] of files) writeFileSync(path, content);
        const result = reevaluateBaseline(root, output);
        assert.equal(result.oracle.version, restrictionOracleVersion);
        assert.match(result.oracle.sourceSha256, /^[a-f0-9]{64}$/);
        assert.deepEqual(
            result.series.map(({ reports, reevaluated, changed }) => ({ reports, reevaluated, changed })),
            [
                { reports: 1, reevaluated: 1, changed: 1 },
                { reports: 2, reevaluated: 1, changed: 1 }
            ]
        );
        assert.equal(result.reports.find((row) => row.reason === 'aborted')?.newVerdict, false);
        for (const [path, content] of files) assert.equal(readFileSync(path, 'utf8'), content);
        assert.equal(JSON.parse(readFileSync(join(output, 'reevaluation.json'), 'utf8')).mode, 'offline-reevaluation');
        assert.match(readFileSync(join(output, 'reevaluation.md'), 'utf8'), /not a new live baseline/);
        assert.throws(() => reevaluateBaseline(root, join(root, 'new-results')), /outside the historical baseline/);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
