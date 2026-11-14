import { expect, type Browser, type BrowserContext } from '@playwright/test';
import { join } from 'node:path';
import type { RuntimeSnapshot } from '../../apps/radix-playground/src/app/agent-runtime/types.ts';
import { artifactWriter, revision } from './artifacts.ts';
import { connectRuntime } from './bridge.ts';
import { agentInstructions } from './instructions.ts';
import { runAgent } from './loop.ts';
import {
    observeDemo,
    prepareScenario,
    scenarios,
    verifyScenario,
    type AssertionResult,
    type ScenarioName,
    type UiObservation
} from './scenarios.ts';
import { toolDefinitions, toolResultSchemas } from './schemas.ts';
import { defaultLimits, RunFailure, type AgentRun, type Limits, type ModelBackend } from './types.ts';

export async function runSession(options: {
    browser: Browser;
    baseURL: string;
    backend: ModelBackend;
    outputRoot: string;
    task?: string;
    scenario?: ScenarioName;
    limits?: Partial<Limits>;
    signal?: AbortSignal;
    secrets?: readonly string[];
}) {
    const writer = artifactWriter(options.outputRoot, options.scenario ?? 'task', options.secrets);
    const started = Date.now();
    const limits = { ...defaultLimits, ...options.limits };
    const deadline = started + limits.totalTimeoutMs;
    const timerAbort = new AbortController();
    const signal = AbortSignal.any([options.signal ?? new AbortController().signal, timerAbort.signal]);
    const timer = setTimeout(
        () => timerAbort.abort(new RunFailure('total-timeout', 'Total session time limit reached.')),
        limits.totalTimeoutMs
    );
    let context: BrowserContext | undefined;
    const closeOnAbort = () => {
        void context?.close().catch(() => {});
    };
    signal.addEventListener('abort', closeOnAbort, { once: true });
    const diagnostics: string[] = [];
    const observations: UiObservation[] = [];
    let bridge: Awaited<ReturnType<typeof connectRuntime>> | undefined;
    let run: AgentRun | undefined;
    let assertions: AssertionResult[] = [];
    let finalSnapshot: RuntimeSnapshot | undefined;
    let finalSnapshotError: string | undefined;
    let integrationPassed: boolean;
    const task = options.scenario ? scenarios[options.scenario].task : options.task!;
    const metadata = {
        mode: options.backend.mode,
        task,
        instructions: agentInstructions,
        limits,
        scenario: options.scenario ?? null,
        configuration: options.backend.configuration,
        environment: {
            node: process.version,
            platform: process.platform,
            browser: options.browser.browserType().name(),
            browserVersion: options.browser.version()
        },
        revision: revision(),
        tools: toolDefinitions
    };
    try {
        writer.json('metadata.json', metadata);
        signal.throwIfAborted();
        context = await options.browser.newContext({ baseURL: options.baseURL });
        signal.throwIfAborted();
        const page = await context.newPage();
        page.setDefaultTimeout(Math.min(5000, Math.max(1, deadline - Date.now())));
        page.on('pageerror', () => diagnostics.push('Application pageerror.'));
        page.on('console', (message) => {
            if (message.type() === 'error') diagnostics.push('Application console error.');
        });
        await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
        await page.goto('/playground/agents', { timeout: Math.max(1, Math.min(30_000, deadline - Date.now())) });
        await expect(page.getByRole('heading', { name: 'Agent Playground', exact: true })).toBeVisible();
        await page.waitForFunction(
            () =>
                (
                    window as Window & { radixAgentRuntime?: { snapshot(): { controls: unknown[] } } }
                ).radixAgentRuntime?.snapshot().controls.length === 3
        );
        await prepareScenario(page, options.scenario);
        const connected = await connectRuntime(page);
        bridge = connected;
        if (diagnostics.length) throw new Error('Application errors during preparation.');
        const observedBridge = {
            ...connected,
            async call(name: Parameters<typeof connected.call>[0], args: unknown) {
                const result = await connected.call(name, args);
                if (name === 'act') {
                    observations.push(await observeDemo(page));
                    writer.json('observations.json', observations);
                }
                return result;
            }
        };
        run = await runAgent({
            task,
            backend: options.backend,
            bridge: observedBridge,
            limits,
            signal,
            deadline,
            onEvent: writer.event
        });
        try {
            const state = JSON.parse(await page.getByTestId('project-form-state').innerText());
            if (!state.dialogOpen && !state.visibilityOpen && !state.environmentOpen)
                await expect(page.locator('[rdxDialogPopup], [rdxSelectPopup]')).toHaveCount(0);
            // Read after the agent stopped. This observation is never supplied to the model as another tool.
            const snapshot = await bridge.call('snapshot', {});
            finalSnapshot = toolResultSchemas.snapshot.parse(snapshot) as RuntimeSnapshot;
            run.finalSnapshot = finalSnapshot;
        } catch {
            run.finalSnapshot = undefined;
            finalSnapshotError = 'Final runtime snapshot unavailable (page navigated, disappeared or closed).';
        }
        assertions = await verifyScenario(page, run, options.scenario, observations);
        assertions.push({ name: 'no application errors', passed: diagnostics.length === 0 });
        await page.screenshot({ path: join(writer.directory, 'final.png'), fullPage: true });
    } catch (error) {
        assertions.push({
            name: 'session setup, observation and verification',
            passed: false,
            message: error instanceof Error ? error.message : 'The browser session could not finish.'
        });
    } finally {
        clearTimeout(timer);
        signal.removeEventListener('abort', closeOnAbort);
        await bridge?.dispose().catch(() => {});
        await context?.tracing.stop({ path: join(writer.directory, 'trace.zip') }).catch(() => {});
        await context?.close().catch(() => {});
        integrationPassed = Boolean(
            run?.reason === 'completed' && assertions.length && assertions.every((check) => check.passed)
        );
        const report = {
            ...metadata,
            run: run ?? null,
            finalSnapshot: finalSnapshot ?? null,
            finalSnapshotError,
            reason: signal.aborted
                ? signal.reason instanceof RunFailure
                    ? signal.reason.reason
                    : 'aborted'
                : (run?.reason ?? 'preparation-error'),
            assertions,
            observations,
            goalChecked: Boolean(options.scenario),
            diagnostics,
            durationMs: Date.now() - started,
            integrationPassed,
            passed: options.scenario ? integrationPassed : null
        };
        writer.json('report.json', report);
    }
    return {
        directory: writer.directory,
        run,
        assertions,
        integrationPassed,
        passed: options.scenario ? integrationPassed : null
    };
}
