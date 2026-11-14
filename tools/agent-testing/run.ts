import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { codexBackend } from './codex.ts';
import { openAIBackend } from './openai.ts';
import { scenarios, type ScenarioName } from './scenarios.ts';
import { toolDefinitions } from './schemas.ts';
import { runSession } from './session.ts';
import { defaultLimits } from './types.ts';

export const help = `Radix NG local runtime agent (Node 24, pnpm)
  pnpm agent:run --provider codex --scenario all --model MODEL
  pnpm agent:run --task "Rename the project to My project" --model MODEL
  pnpm agent:run --scenario all --model MODEL
  pnpm agent:run --schemas | --list | --help

Serve the built site first: pnpm build-site
  pnpm exec http-server dist/radix-site -a 127.0.0.1 -p 4496 -c-1

Provider: --provider openai (default) or codex.
OpenAI: OPENAI_API_KEY, or --api-key-env VARIABLE. Model: --model or OPENAI_MODEL.
Codex: codex login with ChatGPT (subscription allowance). Model: --model or CODEX_MODEL.
Codex requires CLI >= 0.169.0, uses isolated JSON decisions, and never falls back to API billing.
Options: --base-url (default http://127.0.0.1:4496), --out (default dist/agent-testing)
  --max-steps 16 --max-tool-calls 48 --request-timeout-ms 30000 --total-timeout-ms 180000
  --max-output-tokens 2048 --reasoning-effort none|minimal|low|medium|high|xhigh
Codex defaults: --request-timeout-ms 60000 --total-timeout-ms 300000; no --max-output-tokens.
Each scenario owns a fresh context. Both providers make live model requests; there is no replay mode.`;

export function configuration(args: string[], env: NodeJS.ProcessEnv = process.env) {
    const { values } = parseArgs({
        args,
        allowPositionals: false,
        strict: true,
        options: {
            help: { type: 'boolean' },
            schemas: { type: 'boolean' },
            list: { type: 'boolean' },
            task: { type: 'string' },
            scenario: { type: 'string' },
            model: { type: 'string' },
            provider: { type: 'string', default: 'openai' },
            'api-key-env': { type: 'string' },
            'base-url': { type: 'string', default: 'http://127.0.0.1:4496' },
            out: { type: 'string', default: 'dist/agent-testing' },
            'max-steps': { type: 'string' },
            'max-tool-calls': { type: 'string' },
            'request-timeout-ms': { type: 'string' },
            'total-timeout-ms': { type: 'string' },
            'max-output-tokens': { type: 'string' },
            'reasoning-effort': { type: 'string' }
        }
    });
    if (values.help || values.schemas || values.list)
        return {
            display: values.schemas
                ? JSON.stringify(toolDefinitions, null, 2)
                : values.list
                  ? JSON.stringify(scenarios, null, 2)
                  : help
        };
    if (Boolean(values.task?.trim()) === Boolean(values.scenario))
        throw new Error('Choose exactly one of --task or --scenario.');
    if (values.scenario && values.scenario !== 'all' && !Object.hasOwn(scenarios, values.scenario))
        throw new Error('Unknown scenario. Use --list.');
    if (values.provider !== 'openai' && values.provider !== 'codex')
        throw new Error('Choose --provider openai or codex.');
    const provider = values.provider;
    const modelVariable = provider === 'codex' ? 'CODEX_MODEL' : 'OPENAI_MODEL';
    const model = values.model ?? env[modelVariable];
    if (!model?.trim()) throw new Error(`Set --model or ${modelVariable}.`);
    if (provider === 'codex' && (values['api-key-env'] !== undefined || values['max-output-tokens'] !== undefined))
        throw new Error('The codex provider does not accept --api-key-env or --max-output-tokens.');
    const apiKeyVariable = values['api-key-env'] ?? 'OPENAI_API_KEY';
    if (!/^[A-Z_][A-Z0-9_]*$/.test(apiKeyVariable)) throw new Error('--api-key-env must name an environment variable.');
    const apiKey = provider === 'openai' ? env[apiKeyVariable] : undefined;
    if (provider === 'openai' && !apiKey?.trim())
        throw new Error(`The credential environment variable ${apiKeyVariable} is not set. No live run was performed.`);
    const baseURL = new URL(values['base-url']!);
    if (
        !['http:', 'https:'].includes(baseURL.protocol) ||
        !['127.0.0.1', 'localhost', '[::1]'].includes(baseURL.hostname) ||
        baseURL.username ||
        baseURL.password ||
        baseURL.pathname !== '/' ||
        baseURL.search ||
        baseURL.hash
    )
        throw new Error('--base-url must be a loopback HTTP(S) origin without credentials, path, query or fragment.');
    const integer = (key: keyof typeof values, fallback: number, maximum: number) => {
        const value = values[key] === undefined ? fallback : Number(values[key]);
        if (!Number.isSafeInteger(value) || value < 1 || value > maximum) throw new Error(`Invalid --${key}.`);
        return value;
    };
    const effort = values['reasoning-effort'];
    if (effort && !['none', 'minimal', 'low', 'medium', 'high', 'xhigh'].includes(effort))
        throw new Error('Invalid --reasoning-effort.');
    return {
        task: values.task,
        scenario: values.scenario as ScenarioName | 'all' | undefined,
        model,
        provider,
        apiKey,
        baseURL: baseURL.origin,
        outputRoot: resolve(values.out!),
        ...(provider === 'openai' ? { maxOutputTokens: integer('max-output-tokens', 2048, 32_768) } : {}),
        reasoningEffort: effort as 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | undefined,
        limits: {
            maxSteps: integer('max-steps', defaultLimits.maxSteps, 100),
            maxToolCalls: integer('max-tool-calls', defaultLimits.maxToolCalls, 300),
            requestTimeoutMs: integer(
                'request-timeout-ms',
                provider === 'codex' ? 60_000 : defaultLimits.requestTimeoutMs,
                300_000
            ),
            totalTimeoutMs: integer(
                'total-timeout-ms',
                provider === 'codex' ? 300_000 : defaultLimits.totalTimeoutMs,
                900_000
            )
        }
    };
}

export function browserEnvironment(env: NodeJS.ProcessEnv = process.env): Record<string, string> {
    // Do not forward provider credentials or other executor secrets into the browser process.
    return Object.fromEntries(
        [
            'PATH',
            'HOME',
            'TMPDIR',
            'TMP',
            'TEMP',
            'LANG',
            'LC_ALL',
            'TZ',
            'DISPLAY',
            'WAYLAND_DISPLAY',
            'XDG_RUNTIME_DIR',
            'SystemRoot'
        ].flatMap((key) => (env[key] ? [[key, env[key]!]] : []))
    );
}

async function main() {
    let config: ReturnType<typeof configuration>;
    try {
        config = configuration(process.argv.slice(2));
    } catch (error) {
        console.error((error as Error).message);
        process.exitCode = 1;
        return;
    }
    if ('display' in config) {
        console.log(config.display);
        return;
    }
    const abort = new AbortController();
    const onInterrupt = () => abort.abort();
    process.on('SIGINT', onInterrupt);
    process.on('SIGTERM', onInterrupt);
    let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
    try {
        let backend;
        try {
            backend =
                config.provider === 'codex'
                    ? await codexBackend({ ...config, signal: abort.signal })
                    : openAIBackend({ ...config, apiKey: config.apiKey! });
        } catch (error) {
            console.error(
                abort.signal.aborted
                    ? 'Agent executor interrupted.'
                    : error instanceof Error
                      ? error.message
                      : 'The model backend could not start.'
            );
            process.exitCode = abort.signal.aborted ? 130 : 1;
            return;
        }
        abort.signal.throwIfAborted();
        browser = await chromium.launch({
            env: browserEnvironment(),
            timeout: Math.min(30_000, config.limits.totalTimeoutMs)
        });
        const selected = config.scenario === 'all' ? (Object.keys(scenarios) as ScenarioName[]) : [config.scenario];
        for (const scenario of selected) {
            if (abort.signal.aborted) break;
            const result = await runSession({
                ...config,
                browser,
                backend,
                scenario,
                signal: abort.signal,
                secrets: config.apiKey ? [config.apiKey] : []
            });
            console.log(
                JSON.stringify({
                    directory: result.directory,
                    mode: backend.mode,
                    reason: result.run?.reason ?? 'session-error',
                    passed: result.passed,
                    goalChecked: Boolean(scenario)
                })
            );
            if (!result.integrationPassed) process.exitCode = 1;
            if (result.run?.reason === 'provider-error') break;
        }
        if (abort.signal.aborted) process.exitCode = 130;
    } finally {
        await browser?.close();
        process.off('SIGINT', onInterrupt);
        process.off('SIGTERM', onInterrupt);
    }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    main().catch(() => {
        console.error(
            'Agent executor could not start or finish. Run with --help; check the configuration and local site.'
        );
        process.exitCode = 1;
    });
}
