import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
    explainsRestriction,
    isRestrictionScenario,
    restrictionEvidence,
    restrictionOracleVersion
} from './restriction-oracle.ts';
import type { AssertionResult } from './scenarios.ts';
import type { AgentRun } from './types.ts';

export interface RecordedReport {
    scenario: string | null;
    reason: string;
    passed: boolean | null;
    run: AgentRun | null;
    assertions: AssertionResult[];
}

const restrictionChecks = {
    observed: 'agent observed the requested restriction through a tool',
    confirmed: 'final runtime state confirms the restriction outcome',
    explanation: 'final explanation acknowledges the obstacle without claiming success'
};

/** Recheck saved restriction evidence; retain every independent browser assertion and termination. */
export function reevaluateReport(report: RecordedReport) {
    const { run, scenario } = report;
    const oldExplanation = report.assertions.find((check) => check.name === restrictionChecks.explanation)?.passed;
    if (
        report.reason !== 'completed' ||
        !run ||
        run.reason !== 'completed' ||
        !scenario ||
        !isRestrictionScenario(scenario)
    )
        return {
            reevaluated: false,
            reason: report.reason,
            oldVerdict: report.passed,
            newVerdict: report.passed,
            oldExplanation: oldExplanation ?? null,
            newExplanation: oldExplanation ?? null,
            checks: null
        };

    const checks = {
        ...restrictionEvidence(scenario, run),
        explanation: explainsRestriction(scenario, run.finalText, run.finalSnapshot?.controls)
    };
    // Missing historical UI/model assertions cannot establish independent confirmation offline.
    const required = [
        'executor completed normally',
        'UI and runtime agree with the application model',
        'form model matches the task oracle',
        ...Object.values(restrictionChecks)
    ];
    const assertions = report.assertions.map((check) => {
        const replacement = Object.entries(restrictionChecks).find(([, name]) => name === check.name);
        return replacement ? { ...check, passed: checks[replacement[0] as keyof typeof checks] } : check;
    });
    return {
        reevaluated: true,
        reason: report.reason,
        oldVerdict: report.passed,
        newVerdict:
            required.every((name) => assertions.some((check) => check.name === name && check.passed)) &&
            assertions.every((check) => check.passed),
        oldExplanation: oldExplanation ?? null,
        newExplanation: checks.explanation,
        checks
    };
}

const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
function reports(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? reports(path) : entry.name === 'report.json' ? [path] : [];
    });
}

export function reevaluateBaseline(input: string, output: string) {
    const root = resolve(input);
    const destination = resolve(output);
    if (destination === root || destination.startsWith(root + sep))
        throw new Error('Write reevaluation outside the historical baseline directory.');
    const rows = ['initial', 'final'].flatMap((series) =>
        reports(join(root, series))
            .sort()
            .map((file) => {
                const original = readFileSync(file);
                const report = JSON.parse(original.toString('utf8')) as RecordedReport;
                return {
                    series,
                    scenario: report.scenario,
                    sourceReport: relative(destination, file).replaceAll('\\', '/'),
                    sourceSha256: sha256(original),
                    ...reevaluateReport(report)
                };
            })
    );
    const result = {
        generatedAt: new Date().toISOString(),
        mode: 'offline-reevaluation',
        oracle: {
            version: restrictionOracleVersion,
            sourceSha256: sha256(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'restriction-oracle.ts')))
        },
        scope: 'Rechecks saved tool evidence, final snapshot and explanation for completed restriction scenarios. Other recorded browser assertions and stop reasons are retained. No browser execution or model request.',
        series: ['initial', 'final'].map((name) => {
            const selected = rows.filter((row) => row.series === name);
            return {
                name,
                reports: selected.length,
                completed: selected.filter((row) => row.reason === 'completed').length,
                reevaluated: selected.filter((row) => row.reevaluated).length,
                oldPassed: selected.filter((row) => row.oldVerdict === true).length,
                newPassed: selected.filter((row) => row.newVerdict === true).length,
                changed: selected.filter((row) => row.oldVerdict !== row.newVerdict).length
            };
        }),
        reports: rows
    };
    mkdirSync(destination, { recursive: true });
    writeFileSync(join(destination, 'reevaluation.json'), JSON.stringify(result, null, 2) + '\n');
    writeFileSync(
        join(destination, 'reevaluation.md'),
        [
            '# Restriction oracle reevaluation',
            '',
            `Oracle: ${result.oracle.version} (SHA-256 ${result.oracle.sourceSha256}).`,
            '',
            result.scope,
            '',
            '| Series | Scenario | Termination | Old verdict | New verdict | Rechecked | Original report |',
            '| --- | --- | --- | --- | --- | --- | --- |',
            ...rows.map(
                (row) =>
                    `| ${row.series} | ${row.scenario} | ${row.reason} | ${row.oldVerdict} | ${row.newVerdict} | ${row.reevaluated} | [report](${row.sourceReport}) |`
            ),
            '',
            'Historical reports and baseline summaries are unchanged. This is a separate offline result, not a new live baseline.',
            ''
        ].join('\n')
    );
    return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const [, , input, output] = process.argv;
    if (!input || !output) throw new Error('Usage: node tools/agent-testing/reevaluate.ts BASELINE OUTPUT_DIRECTORY');
    console.log(JSON.stringify(reevaluateBaseline(input, output).series));
}
