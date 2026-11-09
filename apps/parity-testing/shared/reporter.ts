import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Keep all observations, including known differences and failures, in a CI-downloadable artifact. */
export default class ParityReporter implements Reporter {
    private readonly rows: { scenario: string; status: string; observations: unknown; errors: string[] }[] = [];
    private readonly options: { title: string; outputDirectory: string };
    constructor(options: { title: string; outputDirectory: string }) {
        this.options = options;
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const attachment = result.attachments.find((item) => item.name === 'observations');
        const data = attachment?.body ?? (attachment?.path ? readFileSync(attachment.path) : undefined);
        this.rows.push({
            scenario: test.title,
            status: result.status,
            observations: data ? JSON.parse(data.toString()) : null,
            errors: result.errors.map((error) => error.message ?? '')
        });
    }
    onEnd(result: FullResult): void {
        const directory = this.options.outputDirectory;
        mkdirSync(directory, { recursive: true });
        this.rows.sort((a, b) => a.scenario.localeCompare(b.scenario));
        writeFileSync(
            resolve(directory, 'observations.json'),
            JSON.stringify({ status: result.status, node: process.version, scenarios: this.rows }, null, 2)
        );
        const reference = this.rows
            .map(
                (row) =>
                    row.observations as {
                        reference?: { commit: string; packageVersion: string; digest: string };
                    } | null
            )
            .find((row) => row?.reference)?.reference;
        const lines = [
            `# ${this.options.title} differential comparison`,
            '',
            `Result: ${result.status}. Node.js ${process.version}.`,
            ...(reference
                ? [
                      '',
                      `Base UI ${reference.packageVersion} at ${reference.commit}.`,
                      `Source SHA-256: ${reference.digest}.`
                  ]
                : []),
            '',
            '| Scenario | Result | Recorded differences |',
            '| --- | --- | --- |'
        ];
        for (const row of this.rows) {
            const observation = row.observations as { differences?: { category: string }[] } | null;
            const categories = [...new Set(observation?.differences?.map((difference) => difference.category) ?? [])];
            lines.push(`| ${row.scenario} | ${row.status} | ${categories.join(', ') || 'none'} |`);
        }
        lines.push(
            '',
            'Known differences are recorded exceptions, not complete behavioral parity. See apps/parity-testing/README.md.'
        );
        writeFileSync(resolve(directory, 'summary.md'), `${lines.join('\n')}\n`);
    }
}
