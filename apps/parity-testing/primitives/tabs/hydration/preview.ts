import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';
import { hydrationNonce, hydrationSettings } from './cases.ts';
export function tabsHydrationPreview(fixturesDirectory: string): Plugin {
    return {
        name: 'tabs-hydration-preview',
        configurePreviewServer(server) {
            server.middlewares.use(async (request, response, next) => {
                const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
                const match = /^\/(angular|react)-hydration\.html$/.exec(url.pathname);
                if (!match) return next();
                try {
                    const document = await readFile(join(fixturesDirectory, match[1] + '-hydration.html'), 'utf8');
                    const { renderHydration } = await import(
                        pathToFileURL(join(fixturesDirectory, '../hydration-server/server.mjs')).href
                    );
                    const html = await renderHydration(match[1], url.href, document);
                    response.setHeader('Content-Type', 'text/html; charset=utf-8');
                    if (hydrationSettings(url.href).csp)
                        response.setHeader(
                            'Content-Security-Policy',
                            `script-src 'nonce-${hydrationNonce}' 'strict-dynamic'; object-src 'none'; base-uri 'self'`
                        );
                    response.end(html);
                } catch (error) {
                    next(error);
                }
            });
        }
    };
}
