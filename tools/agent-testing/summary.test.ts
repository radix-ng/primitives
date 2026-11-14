import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

// Synthetic evidence only: these fixtures never contact Codex or a browser.
function fixture(root: string, path: string, overrides: Record<string, unknown> = {}) {
    const directory = join(root, path);
    mkdirSync(directory, { recursive: true });
    writeFileSync(
        join(directory, 'report.json'),
        JSON.stringify({
            mode: 'live',
            scenario: 'rename',
            passed: true,
            reason: 'completed',
            configuration: { provider: 'codex', model: 'fixture', reasoningEffort: 'low' },
            environment: { browser: 'fixture' },
            limits: { maxSteps: 16 },
            revision: { commit: 'fixture', dirty: true, sourceSha256: 'first' },
            assertions: [{ name: 'goal', passed: true }],
            durationMs: 100,
            run: {
                steps: 3,
                toolCalls: 2,
                message: 'finished',
                events: [{ type: 'response' }, { type: 'response' }, { type: 'response' }],
                usage: [
                    { input_tokens: 10, cached_input_tokens: 4, output_tokens: 2 },
                    { input_tokens: 20, output_tokens: 3 }
                ]
            },
            ...overrides
        })
    );
    writeFileSync(join(directory, 'trace.zip'), 'fixture artifact');
}
function runSummary(root: string) {
    return spawnSync(process.execPath, [resolve('tools/agent-testing/summarize.ts'), root], { encoding: 'utf8' });
}

test('summary preserves failures, series, differing digests, counts, missing usage and artifact links', () => {
    const root = mkdtempSync(join(tmpdir(), 'radix-summary-test-'));
    try {
        writeFileSync(
            join(root, 'baseline.json'),
            JSON.stringify({
                model: 'fixture',
                reasoningEffort: 'low',
                reviews: {
                    'initial/failure/report.json': {
                        classification: 'model-action/answer',
                        analysis: 'Fixture failed its goal.'
                    }
                },
                series: { initial: { stopReason: 'fixture complete' }, final: { stopReason: 'fixture partial' } }
            })
        );
        fixture(root, 'initial/success');
        fixture(root, 'initial/failure', {
            passed: false,
            reason: 'step-limit',
            revision: { commit: 'fixture', dirty: true, sourceSha256: 'different' },
            assertions: [{ name: 'goal', passed: false }]
        });
        fixture(root, 'final/attempt-1/success', { run: { steps: 1, toolCalls: 0, events: [{ type: 'response' }] } });
        const result = runSummary(root);
        assert.equal(result.status, 0, result.stderr);
        const summary = JSON.parse(readFileSync(join(root, 'summary.json'), 'utf8'));
        assert.equal(summary.runs.length, 3);
        assert.deepEqual(
            summary.series.map((group: { actualRuns: number }) => group.actualRuns),
            [2, 1]
        );
        assert.equal(summary.series[0].successes, 1);
        assert.equal(summary.series[0].sameRevisionAndSettings, false);
        assert.equal(summary.series[1].sameRevisionAndSettings, true);
        const failed = summary.runs.find((run: { passed: boolean }) => !run.passed);
        assert.equal(failed.classification, 'model-action/answer');
        assert.equal(failed.failedAssertions.length, 1);
        assert.equal(failed.stopReason, 'step-limit');
        assert.deepEqual(failed.tokenTotals, { input_tokens: 30, cached_input_tokens: 4, output_tokens: 5 });
        assert.equal(failed.usageResponses, 2);
        const initial = summary.series[0].scenarios.find((row: { scenario: string }) => row.scenario === 'rename');
        assert.equal(initial.decisionsRequested, 6);
        assert.equal(initial.decisionsReturned, 6);
        assert.equal(initial.modelRuntimeCalls, 4);
        assert.equal(initial.durationMs, 200);
        const final = summary.runs.find((run: { series: string }) => run.series === 'final');
        assert.deepEqual(final.rawUsage, []);
        assert.deepEqual(final.tokenTotals, {});
        assert.equal(final.usageResponses, 0);
        assert.equal(final.modelRuntimeCalls, 0);
        assert.equal(final.artifacts['trace.zip'], 'final/attempt-1/success/trace.zip');
        assert.equal(
            summary.series[1].scenarios.find((row: { scenario: string }) => row.scenario === 'settings').attempts,
            0
        );
        assert.deepEqual(summary.unreviewedFailures, []);
        const markdown = readFileSync(join(root, 'summary.md'), 'utf8');
        assert.match(markdown, /Fixture failed its goal/);
        assert.match(markdown, /Missing usage is unknown/);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test('summary leaves unreviewed failures visible and rejects deterministic evidence', () => {
    const root = mkdtempSync(join(tmpdir(), 'radix-summary-test-'));
    try {
        writeFileSync(join(root, 'baseline.json'), '{}');
        fixture(root, 'initial/failure', { passed: false });
        assert.equal(runSummary(root).status, 0);
        const summary = JSON.parse(readFileSync(join(root, 'summary.json'), 'utf8'));
        assert.deepEqual(summary.unreviewedFailures, ['initial/failure/report.json']);
        fixture(root, 'final/replay', { mode: 'deterministic' });
        const result = runSummary(root);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /Not a live Codex report/);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
