import OpenAI from 'openai';
import { toResponseInputItems } from 'openai/lib/responses/ResponseInputItems';
import type { ResponseInput, ResponseOutputItem } from 'openai/resources/responses/responses';
import { toolDefinitions } from './schemas.ts';
import { RunFailure, type ModelBackend } from './types.ts';

export function openAIBackend(
    options: {
        apiKey: string;
        model: string;
        maxOutputTokens?: number;
        reasoningEffort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
    },
    transport: { fetch?: typeof fetch } = {}
): ModelBackend {
    const { model, maxOutputTokens = 2048, reasoningEffort } = options;
    const client = new OpenAI({
        apiKey: options.apiKey,
        baseURL: 'https://api.openai.com/v1',
        maxRetries: 0,
        logLevel: 'off',
        ...transport
    });
    const configuration = {
        provider: 'openai',
        model,
        maxOutputTokens,
        ...(reasoningEffort ? { reasoningEffort } : {}),
        store: false,
        parallelToolCalls: false
    };
    return {
        mode: 'live',
        configuration,
        async respond(history, instructions, signal) {
            try {
                const response = await client.responses.create(
                    {
                        model,
                        instructions,
                        input: [...history] as unknown as ResponseInput,
                        store: false,
                        parallel_tool_calls: false,
                        max_output_tokens: maxOutputTokens,
                        ...(reasoningEffort ? { reasoning: { effort: reasoningEffort } } : {}),
                        tools: toolDefinitions.map((tool) => ({
                            type: 'function',
                            name: tool.name,
                            description: tool.description,
                            parameters: tool.inputSchema,
                            // Preserve the runtime's optional filters and action-dependent value argument.
                            // Validation is enforced locally from the very same schemas.
                            strict: false
                        }))
                    },
                    { signal }
                );
                if (response.status !== 'completed')
                    throw new RunFailure(
                        'provider-error',
                        `OpenAI response was ${response.status ?? 'missing a status'} (possibly an output-token limit).`
                    );
                const calls = response.output
                    .filter((item) => item.type === 'function_call')
                    .map((item) => ({ id: item.call_id, name: item.name, arguments: item.arguments }));
                const text = response.output
                    .filter((item) => item.type === 'message')
                    .filter((item) => item.phase !== 'commentary')
                    .flatMap((item) =>
                        item.content.filter((part) => part.type === 'output_text').map((part) => part.text)
                    )
                    .join('\n');
                return {
                    calls,
                    text,
                    // Preserve encrypted reasoning and assistant phase in append-only conversation history.
                    output: toResponseInputItems(response.output as ResponseOutputItem[]) as unknown as Record<
                        string,
                        unknown
                    >[],
                    responseId: response.id,
                    model: response.model,
                    usage: response.usage
                };
            } catch (error) {
                if (signal.aborted) throw signal.reason;
                if (error instanceof RunFailure) throw error;
                // Never retain response bodies, request headers or the SDK error object.
                const status = error instanceof OpenAI.APIError ? error.status : undefined;
                throw new RunFailure(
                    'provider-error',
                    status ? `OpenAI request failed (HTTP ${status}).` : 'OpenAI request failed.'
                );
            }
        }
    };
}
