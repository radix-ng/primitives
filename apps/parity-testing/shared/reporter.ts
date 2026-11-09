import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface Observation {
    reference?: { commit: string; packageVersion: string; digest: string };
    browser?: { name: string; version: string };
    differences?: { category: string }[];
}

/** Keep all observations, including known differences and failures, in a CI-downloadable artifact. */
export default class ParityReporter implements Reporter {
    private readonly rows: {
        browser: string;
        scenario: string;
        status: string;
        observations: unknown;
        errors: string[];
        annotations: { type: string; description?: string }[];
    }[] = [];
    private readonly options: { title: string; outputDirectory: string };
    constructor(options: { title: string; outputDirectory: string }) {
        this.options = options;
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const attachment = result.attachments.find((item) => item.name === 'observations');
        const data = attachment?.body ?? (attachment?.path ? readFileSync(attachment.path) : undefined);
        this.rows.push({
            browser: test.parent.project()?.name ?? 'unknown',
            scenario: test.title,
            status: result.status,
            observations: data ? JSON.parse(data.toString()) : null,
            errors: result.errors.map((error) => error.message ?? ''),
            annotations: result.annotations ?? []
        });
    }
    onEnd(result: FullResult): void {
        const directory = this.options.outputDirectory;
        mkdirSync(directory, { recursive: true });
        this.rows.sort((a, b) => a.browser.localeCompare(b.browser) || a.scenario.localeCompare(b.scenario));
        writeFileSync(
            resolve(directory, 'observations.json'),
            JSON.stringify(
                {
                    status: result.status,
                    node: process.version,
                    platform: process.platform,
                    arch: process.arch,
                    scenarios: this.rows
                },
                null,
                2
            )
        );
        const observations = this.rows.map((row) => row.observations as Observation | null);
        const reference = observations.find((row) => row?.reference)?.reference;
        const browsers = [
            ...new Set(
                observations.flatMap((row) => (row?.browser ? [`${row.browser.name} ${row.browser.version}`] : []))
            )
        ];
        const lines = [
            `# ${this.options.title} differential comparison`,
            '',
            `Result: ${result.status}. Node.js ${process.version}. Platform: ${process.platform}/${process.arch}.`,
            ...(browsers.length ? ['', `Browsers: ${browsers.join(', ')}.`] : []),
            ...(reference
                ? [
                      '',
                      `Base UI ${reference.packageVersion} at ${reference.commit}.`,
                      `Source SHA-256: ${reference.digest}.`
                  ]
                : []),
            '',
            '| Browser | Scenario | Result | Recorded differences | Skip reason |',
            '| --- | --- | --- | --- | --- |'
        ];
        for (const row of this.rows) {
            const observation = row.observations as Observation | null;
            const categories = [...new Set(observation?.differences?.map((difference) => difference.category) ?? [])];
            const skip = row.annotations
                .filter((a) => a.type === 'skip')
                .map((a) => a.description)
                .join('; ');
            lines.push(
                `| ${row.browser} | ${row.scenario} | ${row.status} | ${categories.join(', ') || 'none'} | ${skip} |`
            );
        }
        lines.push(
            '',
            'Known differences are recorded exceptions, not complete behavioral parity. See apps/parity-testing/README.md.'
        );
        writeFileSync(resolve(directory, 'summary.md'), `${lines.join('\n')}\n`);
    }
}
