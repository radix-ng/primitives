import type { RuntimeSnapshot } from '../../apps/radix-playground/src/app/agent-runtime/types.ts';
import { agentInstructions } from './instructions.ts';
import { toolInputSchemas, toolResultSchemas, type ToolName } from './schemas.ts';
import {
    defaultLimits,
    RunFailure,
    type AgentRun,
    type Limits,
    type ModelBackend,
    type RunEvent,
    type RuntimeBridge,
    type StopReason
} from './types.ts';

/** Race even an uncooperative provider/bridge; the AbortSignal also cancels real HTTP requests. */
async function bounded<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number,
    reason: StopReason,
    signal: AbortSignal
): Promise<T> {
    const controller = new AbortController();
    const forward = () => controller.abort(signal.reason);
    if (signal.aborted) forward();
    else signal.addEventListener('abort', forward, { once: true });
    const timer = setTimeout(() => controller.abort(new RunFailure(reason, reason)), Math.max(0, timeoutMs));
    let abort: () => void = () => {};
    try {
        return await Promise.race([
            new Promise<never>((_, reject) => {
                abort = () => reject(controller.signal.reason ?? new RunFailure('aborted', 'Run aborted.'));
                if (controller.signal.aborted) abort();
                else controller.signal.addEventListener('abort', abort, { once: true });
            }),
            Promise.resolve().then(() => {
                controller.signal.throwIfAborted();
                return operation(controller.signal);
            })
        ]);
    } finally {
        clearTimeout(timer);
        signal.removeEventListener('abort', forward);
        controller.signal.removeEventListener('abort', abort);
    }
}

export async function runAgent(options: {
    task: string;
    backend: ModelBackend;
    bridge: RuntimeBridge;
    limits?: Partial<Limits>;
    signal?: AbortSignal;
    deadline?: number;
    onEvent?: (event: RunEvent) => void;
}): Promise<AgentRun> {
    const { task, backend, bridge } = options;
    const limits = { ...defaultLimits, ...options.limits };
    for (const limit of Object.values(limits))
        if (!Number.isSafeInteger(limit) || limit <= 0) throw new Error('Limits must be positive integers.');
    const started = Date.now();
    const deadline = Math.min(options.deadline ?? Infinity, started + limits.totalTimeoutMs);
    const signal = AbortSignal.any([
        options.signal ?? new AbortController().signal,
        bridge.signal ?? new AbortController().signal
    ]);
    const result: AgentRun = {
        mode: backend.mode,
        task,
        instructions: agentInstructions,
        configuration: backend.configuration,
        limits,
        startedAt: new Date(started).toISOString(),
        durationMs: 0,
        steps: 0,
        toolCalls: 0,
        reason: 'step-limit',
        message: 'Model step limit reached.',
        finalText: '',
        events: [],
        usage: []
    };
    const emit = (type: RunEvent['type'], data: unknown) => {
        const event = {
            sequence: result.events.length + 1,
            elapsedMs: Date.now() - started,
            type,
            data: structuredClone(data)
        };
        result.events.push(event);
        options.onEvent?.(event);
    };
    const withinRun = <T>(operation: (signal: AbortSignal) => Promise<T>) =>
        bounded(operation, deadline - Date.now(), 'total-timeout', signal);
    const discovered = new Set<string>();
    const remember = (data: unknown) => {
        const object = data as { controls?: { id: string }[]; matches?: { id: string }[] };
        for (const control of object.controls ?? object.matches ?? []) discovered.add(control.id);
    };
    const history: Record<string, unknown>[] = [{ role: 'user', content: task }];
    try {
        for (let step = 0; step < limits.maxSteps; step++) {
            await withinRun(() => bridge.check());
            emit('request', { step: step + 1, input: history });
            result.steps++;
            const reply = await withinRun((signal) =>
                bounded(
                    (requestSignal) => backend.respond(history, agentInstructions, requestSignal),
                    limits.requestTimeoutMs,
                    'request-timeout',
                    signal
                )
            );
            emit('response', reply);
            if (reply.usage !== undefined) result.usage.push(reply.usage);
            history.push(...reply.output);
            if (!reply.calls.length) {
                if (!reply.text.trim())
                    throw new RunFailure('provider-error', 'Provider returned no tool call or final answer.');
                result.finalText = reply.text;
                result.reason = 'completed';
                result.message = 'The model finished; independent assertions determine task success.';
                break;
            }
            for (const call of reply.calls) {
                if (result.toolCalls >= limits.maxToolCalls)
                    throw new RunFailure('tool-limit', 'Tool call limit reached.');
                result.toolCalls++;
                emit('tool-call', call);
                const failCall = (reason: StopReason, message: string): never => {
                    emit('tool-result', {
                        callId: call.id,
                        name: call.name,
                        result: { status: 'refused', code: reason, message }
                    });
                    throw new RunFailure(reason, message);
                };
                if (!Object.hasOwn(toolInputSchemas, call.name))
                    failCall('invalid-tool', 'Only snapshot, query and act are available.');
                const name = call.name as ToolName;
                let args: unknown;
                try {
                    args = JSON.parse(call.arguments);
                } catch {
                    failCall('invalid-arguments', 'Tool arguments must be JSON.');
                }
                const parsed = toolInputSchemas[name].safeParse(args);
                if (!parsed.success) failCall('invalid-arguments', 'Tool arguments do not match the JSON Schema.');
                if (name === 'act' && !discovered.has((args as { id: string }).id))
                    failCall('unobserved-id', 'Discover the instance with snapshot/query before acting.');
                const data = await withinRun(() => bridge.call(name, args));
                if (!toolResultSchemas[name].safeParse(data).success)
                    failCall('invalid-result', 'Runtime result does not match the documented schema.');
                remember(data);
                emit('tool-result', { callId: call.id, name, arguments: args, result: data });
                history.push({ type: 'function_call_output', call_id: call.id, output: JSON.stringify(data) });
            }
        }
        await withinRun(() => bridge.check());
        const snapshot = await withinRun(() => bridge.call('snapshot', {}));
        const final = toolResultSchemas.snapshot.safeParse(snapshot);
        if (!final.success) throw new RunFailure('invalid-result', 'Final runtime snapshot does not match the schema.');
        result.finalSnapshot = final.data as RuntimeSnapshot;
    } catch (error) {
        result.reason = error instanceof RunFailure ? error.reason : signal.aborted ? 'aborted' : 'provider-error';
        // Provider HTTP bodies/errors can echo credentials. The backend supplies safe errors only.
        result.message = error instanceof RunFailure ? error.message : 'The provider or runtime operation failed.';
    }
    result.durationMs = Date.now() - started;
    emit('stop', { reason: result.reason, message: result.message, durationMs: result.durationMs });
    return result;
}
