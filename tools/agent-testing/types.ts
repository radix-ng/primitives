import type { RuntimeSnapshot } from '../../apps/radix-playground/src/app/agent-runtime/types.ts';
import type { ToolName } from './schemas.ts';

export interface ToolCall {
    id: string;
    name: string;
    arguments: string;
}
export interface ModelReply {
    calls: ToolCall[];
    text: string;
    output: Record<string, unknown>[];
    model?: string;
    responseId?: string;
    usage?: unknown;
}
export interface ModelBackend {
    readonly mode: 'live' | 'deterministic';
    readonly configuration: Record<string, unknown>;
    respond(
        history: readonly Record<string, unknown>[],
        instructions: string,
        signal: AbortSignal
    ): Promise<ModelReply>;
}
export interface RuntimeBridge {
    readonly signal?: AbortSignal;
    check(): Promise<void>;
    call(name: ToolName, args: unknown): Promise<unknown>;
}
export interface Limits {
    maxSteps: number;
    maxToolCalls: number;
    requestTimeoutMs: number;
    totalTimeoutMs: number;
}
export const defaultLimits: Limits = {
    maxSteps: 16,
    maxToolCalls: 48,
    requestTimeoutMs: 30_000,
    totalTimeoutMs: 180_000
};
export type StopReason =
    | 'completed'
    | 'step-limit'
    | 'tool-limit'
    | 'request-timeout'
    | 'total-timeout'
    | 'provider-error'
    | 'invalid-tool'
    | 'invalid-arguments'
    | 'unobserved-id'
    | 'runtime-lost'
    | 'navigation'
    | 'browser-error'
    | 'invalid-result'
    | 'aborted';
export interface RunEvent {
    sequence: number;
    elapsedMs: number;
    type: 'request' | 'response' | 'tool-call' | 'tool-result' | 'stop';
    data: unknown;
}
export interface AgentRun {
    mode: ModelBackend['mode'];
    task: string;
    instructions: string;
    configuration: Record<string, unknown>;
    limits: Limits;
    startedAt: string;
    durationMs: number;
    steps: number;
    toolCalls: number;
    reason: StopReason;
    message: string;
    finalText: string;
    finalSnapshot?: RuntimeSnapshot;
    events: RunEvent[];
    usage: unknown[];
}
export class RunFailure extends Error {
    readonly reason: StopReason;
    constructor(reason: StopReason, message: string) {
        super(message);
        this.name = 'RunFailure';
        this.reason = reason;
    }
}
