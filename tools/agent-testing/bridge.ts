import type { JSHandle, Page } from '@playwright/test';
import type { AgentRuntimeApi } from '../../apps/radix-playground/src/app/agent-runtime/types.ts';
import type { ToolName } from './schemas.ts';
import { RunFailure, type RuntimeBridge } from './types.ts';

export async function connectRuntime(page: Page): Promise<RuntimeBridge & { dispose(): Promise<void> }> {
    const controller = new AbortController();
    const runtime: JSHandle<AgentRuntimeApi | undefined> = await page.evaluateHandle(
        () => (window as Window & { radixAgentRuntime?: AgentRuntimeApi }).radixAgentRuntime
    );
    const onNavigation = () =>
        controller.abort(new RunFailure('navigation', 'The page navigated after the runtime was connected.'));
    const onFrame = (frame: ReturnType<Page['mainFrame']>) => {
        if (frame === page.mainFrame()) onNavigation();
    };
    const onClosed = () => controller.abort(new RunFailure('runtime-lost', 'The browser page closed or crashed.'));
    const onError = () =>
        controller.abort(new RunFailure('browser-error', 'An application pageerror or console error occurred.'));
    const onConsole = (message: { type(): string }) => {
        if (message.type() === 'error') onError();
    };
    page.on('framenavigated', onFrame);
    page.on('close', onClosed);
    page.on('crash', onClosed);
    page.on('pageerror', onError);
    page.on('console', onConsole);
    async function call(name: ToolName | 'check', args: unknown = {}): Promise<unknown> {
        controller.signal.throwIfAborted();
        try {
            // Only this fixed function executes in the page. Model-supplied strings are arguments, never code.
            const response = await runtime.evaluate(
                async (api, request) => {
                    if (!api || (window as Window & { radixAgentRuntime?: AgentRuntimeApi }).radixAgentRuntime !== api)
                        return { connected: false as const };
                    switch (request.name) {
                        case 'check':
                            return { connected: true as const, data: null };
                        case 'snapshot':
                            return { connected: true as const, data: api.snapshot(request.args) };
                        case 'query':
                            return { connected: true as const, data: api.query(request.args) };
                        case 'act':
                            return { connected: true as const, data: await api.act(request.args) };
                    }
                },
                { name, args }
            );
            controller.signal.throwIfAborted();
            if (!response.connected) throw new RunFailure('runtime-lost', 'The runtime disappeared or was replaced.');
            return response.data;
        } catch (error) {
            if (controller.signal.aborted) throw controller.signal.reason;
            if (error instanceof RunFailure) throw error;
            throw new RunFailure('runtime-lost', 'The runtime boundary is no longer reachable.');
        }
    }
    return {
        signal: controller.signal,
        check: async () => {
            await call('check');
        },
        call,
        async dispose() {
            page.off('framenavigated', onFrame);
            page.off('close', onClosed);
            page.off('crash', onClosed);
            page.off('pageerror', onError);
            page.off('console', onConsole);
            await runtime.dispose();
        }
    };
}
