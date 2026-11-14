import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { codexArguments, codexOutputSchema, codexProcess } from './codex.ts';

// Explicit opt-in: requires an installed CLI, no model connection or authenticated request.
test(
    'installed Codex sends no native tools or authorization to the offline transport fixture',
    {
        skip: process.env['RUN_CODEX_CONTRACT'] !== '1',
        timeout: 20_000
    },
    async () => {
        const directory = await mkdtemp(join(tmpdir(), 'radix-codex-contract-'));
        const requests: { body: Record<string, unknown>; authorization: boolean }[] = [];
        const server = createServer(async (request, response) => {
            let body = '';
            for await (const chunk of request) body += chunk;
            if (request.url === '/responses')
                requests.push({ body: JSON.parse(body), authorization: Boolean(request.headers.authorization) });
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(
                JSON.stringify({ error: { message: 'Offline contract fixture.', type: 'invalid_request_error' } })
            );
        });
        try {
            await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
            const address = server.address();
            assert.ok(address && typeof address !== 'string');
            await writeFile(join(directory, 'schema.json'), JSON.stringify(codexOutputSchema));
            const production = codexArguments({ model: 'fixture', directory, instructions: 'Read controls.' });
            // Do not change real login state for a fixture provider that needs no authentication.
            const args = production.filter(
                (arg, index) =>
                    arg !== 'forced_login_method="chatgpt"' &&
                    !(arg === '-c' && production[index + 1] === 'forced_login_method="chatgpt"')
            );
            args.splice(
                -1,
                0,
                '-c',
                'model_provider="fixture"',
                '-c',
                `model_providers.fixture={name="fixture",base_url="http://127.0.0.1:${address.port}",wire_api="responses",requires_openai_auth=false,request_max_retries=0,stream_max_retries=0}`,
                '-c',
                'features.enable_request_compression=false'
            );
            await assert.rejects(
                codexProcess({ args, cwd: directory, input: 'Read controls.', signal: AbortSignal.timeout(15_000) })
            );
            assert.equal(requests.length, 1);
            assert.deepEqual(requests[0].body.tools, []);
            assert.equal(requests[0].authorization, false);
            assert.equal(requests[0].body.model, 'fixture');
        } finally {
            server.closeAllConnections();
            await new Promise<void>((resolve) => server.close(() => resolve()));
            await rm(directory, { recursive: true, force: true });
        }
    }
);
