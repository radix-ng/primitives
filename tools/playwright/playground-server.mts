import type { PlaywrightTestConfig } from '@playwright/test';

/** Both runtime and executor checks serve the same composed production site without an SPA fallback. */
export function playgroundServer(workspaceRoot: string) {
    const port = Number(process.env['PLAYWRIGHT_PORT'] ?? 4496);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PLAYWRIGHT_PORT.');
    const baseURL = `http://localhost:${port}`;
    return {
        baseURL,
        webServer: {
            command: `pnpm exec http-server dist/radix-site -a 127.0.0.1 -p ${port} -s -c-1`,
            cwd: workspaceRoot,
            url: `${baseURL}/playground/agents/index.html`,
            reuseExistingServer: false
        } satisfies PlaywrightTestConfig['webServer']
    };
}
