import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ControlSnapshot } from '../../apps/radix-playground/src/app/agent-runtime/types.ts';
import { connectRuntime } from './bridge.ts';
import { runAgent } from './loop.ts';
import { scenarios, type ScenarioName } from './scenarios.ts';
import { toolDefinitions } from './schemas.ts';
import { runSession } from './session.ts';
import type { ModelBackend, ModelReply, ToolCall } from './types.ts';

// Deliberately scripted protocol fixtures. These verify the executor, never LLM performance.
function scriptedScenario(name: ScenarioName): ModelBackend {
    let step = 0;
    let controls: ControlSnapshot[] = [];
    const next = (tool: string, args: unknown): ModelReply => {
        const call: ToolCall = { id: `fixture-${++step}`, name: tool, arguments: JSON.stringify(args) };
        return {
            calls: [call],
            text: '',
            output: [{ type: 'function_call', call_id: call.id, name: tool, arguments: call.arguments }]
        };
    };
    const command = (label: string, action: string, value?: string) => {
        const control = controls.find((entry) => entry.name === label);
        if (!control) throw new Error(`Missing fixture control ${label}`);
        return next('act', { id: control.id, action, ...(value === undefined ? {} : { value }) });
    };
    return {
        mode: 'deterministic',
        configuration: { provider: 'scripted-protocol-fixture', scenario: name },
        async respond(history) {
            if (!step) return next('snapshot', {});
            const last = JSON.parse(history.at(-1)!['output'] as string);
            if (last.controls) controls = last.controls;
            if (name === 'rename') {
                if (step === 1) return command('Project name', 'set-value', 'Agent workspace');
                if (step === 2) return command('Visibility', 'select-option', 'public');
            } else if (name === 'settings') {
                if (step === 1) return command('Project settings', 'open');
                if (step === 2) return next('snapshot', {});
                if (step === 3) return command('Change note', 'set-value', 'Ready for production');
                if (step === 4) return command('Environment', 'select-option', 'production');
                if (step === 5) return command('Project settings', 'close');
            } else if (name === 'canceled' && step === 1)
                return command('Project name', 'set-value', 'Agent workspace');
            return {
                calls: [],
                text:
                    name === 'canceled'
                        ? 'The change was canceled and was not applied.'
                        : name === 'disabled'
                          ? 'Controls are disabled.'
                          : name === 'read-only'
                            ? 'Controls are read-only.'
                            : name === 'archived'
                              ? 'Archived is disabled.'
                              : 'Completed.',
                output: []
            };
        }
    };
}

function restrictedReply(observation: 'snapshot' | 'query' | 'none', text: string): ModelBackend {
    let observed = false;
    return {
        mode: 'deterministic',
        configuration: { fixture: 'restriction-summary', observation },
        async respond() {
            if (observation !== 'none' && !observed) {
                observed = true;
                const args = observation === 'query' ? { name: 'Visibility' } : {};
                const argumentsJson = JSON.stringify(args);
                return {
                    calls: [{ id: 'observe', name: observation, arguments: argumentsJson }],
                    text: '',
                    output: [{ type: 'function_call', call_id: 'observe', name: observation, arguments: argumentsJson }]
                };
            }
            return { calls: [], text, output: [] };
        }
    };
}

for (const name of Object.keys(scenarios) as ScenarioName[])
    test(`scripted executor and independent oracle: ${name}`, async ({ browser, baseURL }, info) => {
        const before = browser.contexts().length;
        const result = await runSession({
            browser,
            baseURL: baseURL!,
            backend: scriptedScenario(name),
            scenario: name,
            outputRoot: info.outputPath('evidence')
        });
        expect(result.assertions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: 'form model matches the task oracle', passed: true })
            ])
        );
        expect(result.assertions.filter((check) => !check.passed)).toEqual([]);
        expect(result.passed).toBe(true);
        if (name === 'archived' || name === 'disabled' || name === 'read-only')
            expect(
                result.run?.events.filter(
                    (event) => event.type === 'tool-call' && (event.data as ToolCall).name === 'act'
                )
            ).toEqual([]);
        expect(browser.contexts().length).toBe(before);
        const report = JSON.parse(readFileSync(join(result.directory, 'report.json'), 'utf8'));
        expect(report.mode).toBe('deterministic');
        expect(report.revision.commit).toMatch(/^[a-f0-9]{40}$/);
        expect(report.finalSnapshot.controls).toHaveLength(3);
        expect(report.run.events.some((event: { type: string }) => event.type === 'tool-call')).toBe(true);
        expect(readFileSync(join(result.directory, 'events.jsonl'), 'utf8').trim().split('\n').length).toBe(
            report.run.events.length
        );
    });

test('saying done without changing the UI fails the independent oracle', async ({ browser, baseURL }, info) => {
    const backend: ModelBackend = {
        mode: 'deterministic',
        configuration: {},
        async respond() {
            return { calls: [], text: 'Done.', output: [] };
        }
    };
    const result = await runSession({
        browser,
        baseURL: baseURL!,
        backend,
        scenario: 'rename',
        outputRoot: info.outputPath('evidence')
    });
    expect(result.run?.reason).toBe('completed');
    expect(result.passed).toBe(false);
    expect(result.assertions).toContainEqual(
        expect.objectContaining({ name: 'form model matches the task oracle', passed: false })
    );
});

for (const observe of [false, true])
    test(`Archived false success is rejected after ${observe ? 'a snapshot' : 'no tool calls'}`, async ({
        browser,
        baseURL
    }, info) => {
        const backend = restrictedReply(observe ? 'snapshot' : 'none', 'Done. Visibility is now Archived.');
        const result = await runSession({
            browser,
            baseURL: baseURL!,
            backend,
            scenario: 'archived',
            outputRoot: info.outputPath('evidence')
        });
        expect(result.run?.reason).toBe('completed');
        expect(result.run?.toolCalls).toBe(observe ? 1 : 0);
        expect(result.run?.finalSnapshot?.controls.find((control) => control.name === 'Visibility')?.value).toBe(
            'private'
        );
        expect(result.passed).toBe(false);
        const report = JSON.parse(readFileSync(join(result.directory, 'report.json'), 'utf8'));
        expect(report.passed).toBe(false);
    });

for (const fixture of [
    {
        scenario: 'archived',
        observation: 'query',
        text: 'Archived is disabled; Visibility remains Private.',
        passed: true
    },
    { scenario: 'archived', observation: 'none', text: 'Archived is disabled.', passed: false },
    {
        scenario: 'archived',
        observation: 'snapshot',
        text: 'Archived is disabled. Visibility is now Archived.',
        passed: false
    },
    { scenario: 'disabled', observation: 'none', text: 'Controls are disabled.', passed: false },
    { scenario: 'read-only', observation: 'none', text: 'Controls are read-only.', passed: false }
] as const)
    test(`restriction evidence: ${fixture.scenario}, ${fixture.observation}, ${fixture.text}`, async ({
        browser,
        baseURL
    }, info) => {
        const result = await runSession({
            browser,
            baseURL: baseURL!,
            backend: restrictedReply(fixture.observation, fixture.text),
            scenario: fixture.scenario,
            outputRoot: info.outputPath('evidence')
        });
        expect(result.passed).toBe(fixture.passed);
        expect(result.run?.toolCalls).toBe(fixture.observation === 'none' ? 0 : 1);
        expect(
            result.run?.events.filter((event) => event.type === 'tool-call' && (event.data as ToolCall).name === 'act')
        ).toEqual([]);
        expect(result.assertions).toContainEqual(
            expect.objectContaining({
                name: 'agent observed the requested restriction through a tool',
                passed: fixture.observation !== 'none'
            })
        );
        expect(result.run?.finalSnapshot?.controls.find((control) => control.name === 'Visibility')?.value).toBe(
            'private'
        );
    });

for (const transition of ['navigation', 'runtime-lost'] as const)
    test(`executor detects ${transition} through its public bridge`, async ({ page }) => {
        await page.goto('/playground/agents');
        await page.waitForFunction(() =>
            Boolean((window as Window & { radixAgentRuntime?: unknown }).radixAgentRuntime)
        );
        const bridge = await connectRuntime(page);
        try {
            if (transition === 'navigation') await page.goto('/playground');
            else
                await page.evaluate(() => {
                    delete (window as Window & { radixAgentRuntime?: unknown }).radixAgentRuntime;
                });
            const run = await runAgent({ task: 'Read controls.', bridge, backend: scriptedScenario('rename') });
            expect(run.reason).toBe(transition);
            expect(run.toolCalls).toBe(0);
        } finally {
            await bridge.dispose();
        }
    });

test('total session timeout closes the context and still writes evidence', async ({ browser, baseURL }, info) => {
    const before = browser.contexts().length;
    const backend: ModelBackend = { mode: 'deterministic', configuration: {}, respond: () => new Promise(() => {}) };
    const result = await runSession({
        browser,
        baseURL: baseURL!,
        backend,
        scenario: 'rename',
        limits: { totalTimeoutMs: 2500, requestTimeoutMs: 10_000 },
        outputRoot: info.outputPath('evidence')
    });
    expect(result.passed).toBe(false);
    expect(browser.contexts().length).toBe(before);
    const report = JSON.parse(readFileSync(join(result.directory, 'report.json'), 'utf8'));
    expect(report.reason).toBe('total-timeout');
});

test('the real browser bridge exposes exactly the schema tools, without an arbitrary evaluation tool', () => {
    expect(toolDefinitions.map((tool) => tool.name)).toEqual(['snapshot', 'query', 'act']);
});
