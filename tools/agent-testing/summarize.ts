import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const scenarios = ['rename', 'settings', 'canceled', 'disabled', 'read-only', 'archived'];
const root = resolve(process.argv[2] ?? 'dist/agent-testing/codex-baseline');
const manifest = JSON.parse(readFileSync(join(root, 'baseline.json'), 'utf8'));
const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
function reports(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? reports(path) : entry.name === 'report.json' ? [path] : [];
    });
}
const runs = reports(root)
    .sort()
    .map((file) => {
        const report = read(file);
        const path = relative(root, file).replaceAll('\\', '/');
        const series = path.split('/')[0];
        if (!['initial', 'final'].includes(series)) throw new Error(`Unexpected series: ${path}`);
        if (report.mode !== 'live' || report.configuration.provider !== 'codex')
            throw new Error(`Not a live Codex report: ${path}`);
        const review = manifest.reviews?.[path];
        const failedAssertions = report.assertions.filter((item: { passed: boolean }) => !item.passed);
        // Failed goals need human review: an oracle failure alone cannot identify its cause.
        const classification = report.passed === true ? 'success' : (review?.classification ?? 'unreviewed');
        const availableUsage = report.run?.usage ?? [];
        const tokenTotals: Record<string, number> = {};
        for (const usage of availableUsage) {
            for (const [key, value] of Object.entries(usage))
                if (typeof value === 'number' && /tokens$/.test(key))
                    tokenTotals[key] = (tokenTotals[key] ?? 0) + value;
        }
        return {
            series,
            scenario: report.scenario,
            passed: report.passed,
            classification,
            analysis: review?.analysis ?? null,
            stopReason: report.reason,
            stopMessage: report.run?.message ?? null,
            failedAssertions,
            decisionsRequested: report.run?.steps ?? 0,
            decisionsReturned:
                report.run?.events.filter((event: { type: string }) => event.type === 'response').length ?? 0,
            modelRuntimeCalls: report.run?.toolCalls ?? 0,
            durationMs: report.durationMs,
            usageResponses: availableUsage.length,
            tokenTotals,
            rawUsage: availableUsage,
            revision: report.revision,
            configuration: report.configuration,
            limits: report.limits,
            environment: report.environment,
            artifacts: Object.fromEntries(
                readdirSync(join(root, relative(root, file), '..')).map((name) => [
                    name,
                    path.replace(/report.json$/, name)
                ])
            )
        };
    });
const series = ['initial', 'final'].map((name) => {
    const selected = runs.filter((run) => run.series === name);
    const expected = name === 'initial' ? 6 : 18;
    const identities = [
        ...new Set(
            selected.map((run) =>
                JSON.stringify({
                    revision: run.revision,
                    configuration: run.configuration,
                    limits: run.limits,
                    environment: run.environment
                })
            )
        )
    ];
    return {
        name,
        expectedRuns: expected,
        actualRuns: selected.length,
        successes: selected.filter((run) => run.passed === true).length,
        sameRevisionAndSettings: identities.length === 1,
        identities: identities.map((identity) => JSON.parse(identity)),
        stopReason: manifest.series?.[name]?.stopReason ?? 'not-recorded',
        scenarios: scenarios.map((scenario) => {
            const attempts = selected.filter((run) => run.scenario === scenario);
            return {
                scenario,
                successes: attempts.filter((run) => run.passed === true).length,
                attempts: attempts.length,
                decisionsRequested: attempts.reduce((n, run) => n + run.decisionsRequested, 0),
                decisionsReturned: attempts.reduce((n, run) => n + run.decisionsReturned, 0),
                modelRuntimeCalls: attempts.reduce((n, run) => n + run.modelRuntimeCalls, 0),
                durationMs: attempts.reduce((n, run) => n + run.durationMs, 0),
                reports: attempts.map((run) => run.artifacts['report.json'])
            };
        })
    };
});
const summary = {
    generatedAt: new Date().toISOString(),
    manifest,
    counting: {
        decisionsRequested: 'run.steps includes failed requests and the final answer decision',
        decisionsReturned: 'response events, including the final answer',
        modelRuntimeCalls:
            'run.toolCalls; excludes preparation, bridge checks and independent observer/final snapshots',
        tokens: 'Sum of CLI-reported numeric token fields only; raw per-response usage retained. Missing usage is unknown, not zero subscription usage. No percentage conversion.'
    },
    series,
    runs,
    unreviewedFailures: runs
        .filter((run) => run.classification === 'unreviewed')
        .map((run) => run.artifacts['report.json'])
};
writeFileSync(join(root, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
const lines = [
    '# Codex subscription baseline',
    '',
    `Generated: ${summary.generatedAt}`,
    '',
    `Model: ${manifest.model}; reasoning effort: ${manifest.reasoningEffort}.`,
    '',
    ...series.flatMap((group) => [
        `## ${group.name}`,
        '',
        `${group.successes}/${group.actualRuns} successful; ${group.expectedRuns} planned. Stop: ${group.stopReason}. Frozen revision/settings: ${group.sameRevisionAndSettings}.`,
        '',
        '| Scenario | Successes/attempts | Decisions requested/returned | Model runtime calls | Duration (s) | Reports |',
        '| --- | --- | --- | --- | --- | --- |',
        ...group.scenarios.map(
            (row) =>
                `| ${row.scenario} | ${row.successes}/${row.attempts} | ${row.decisionsRequested}/${row.decisionsReturned} | ${row.modelRuntimeCalls} | ${(row.durationMs / 1000).toFixed(3)} | ${row.reports.map((path, index) => `[${index + 1}](${path})`).join(', ')} |`
        ),
        ''
    ]),
    '## Attempts and failures',
    '',
    ...runs.map(
        (run) =>
            `- [${run.series}/${run.scenario}](${run.artifacts['report.json']}): ${run.classification}; stop=${run.stopReason}; tokens=${JSON.stringify(run.tokenTotals)} (${run.usageResponses} responses with usage).${run.analysis ? ` ${run.analysis}` : ''}`
    ),
    '',
    '## Counting and limitations',
    '',
    ...Object.values(summary.counting).map((text) => `- ${text}`),
    ...(manifest.limitations ?? []).map((text: string) => `- ${text}`),
    '',
    'Full revision/digests, versions, configuration, per-response token usage, assertions and artifact links are in [summary.json](summary.json).',
    ''
];
writeFileSync(join(root, 'summary.md'), lines.join('\n'));
console.log(JSON.stringify({ root, reports: runs.length, unreviewedFailures: summary.unreviewedFailures.length }));
