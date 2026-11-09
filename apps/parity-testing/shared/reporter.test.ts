import type { FullResult, TestCase, TestResult } from '@playwright/test/reporter';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import ParityReporter from './reporter.ts';

test('the same scenario retains separate browser results, versions and failure evidence', () => {
    const directory = mkdtempSync(join(tmpdir(), 'radix-parity-report-'));
    try {
        const reporter = new ParityReporter({ title: 'Select', outputDirectory: directory });
        for (const browser of ['webkit', 'chromium', 'firefox']) {
            const failed = browser === 'firefox';
            reporter.onTestEnd(
                { title: 'keyboard', parent: { project: () => ({ name: browser }) } } as TestCase,
                {
                    status: failed ? 'failed' : 'passed',
                    attachments: failed
                        ? []
                        : [
                              {
                                  name: 'observations',
                                  body: Buffer.from(
                                      JSON.stringify({
                                          reference: { commit: 'abc', packageVersion: '1.9.0', digest: 'sha' },
                                          browser: { name: browser, version: '123' },
                                          differences: [{ category: 'dom-focus' }]
                                      })
                                  )
                              }
                          ],
                    errors: failed ? [{ message: 'Browser launch failed' }] : []
                } as TestResult
            );
        }
        reporter.onEnd({ status: 'failed' } as FullResult);
        const report = JSON.parse(readFileSync(join(directory, 'observations.json'), 'utf8'));
        assert.equal(report.status, 'failed');
        assert.equal(report.platform, process.platform);
        assert.equal(report.arch, process.arch);
        assert.deepEqual(
            report.scenarios.map((row: { browser: string }) => row.browser),
            ['chromium', 'firefox', 'webkit']
        );
        assert.equal(report.scenarios[0].observations.browser.version, '123');
        assert.equal(report.scenarios[1].observations, null);
        assert.deepEqual(report.scenarios[1].errors, ['Browser launch failed']);
        const summary = readFileSync(join(directory, 'summary.md'), 'utf8');
        assert.match(summary, /Base UI 1\.9\.0 at abc/);
        assert.match(summary, /Browsers: chromium 123, webkit 123/);
        assert.match(summary, /\| chromium \| keyboard \| passed \| dom-focus \|/);
        assert.match(summary, /\| firefox \| keyboard \| failed \| none \|/);
        assert.match(summary, /\| webkit \| keyboard \| passed \| dom-focus \|/);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
