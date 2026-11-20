import angular from '@analogjs/vite-plugin-angular';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from 'vite';

const directory = resolve('apps/radix-ssr-testing/hydration-audit');
const phase = 'runtime';
const output = resolve('dist/portal-hydration-audit');

export default defineConfig({
    root: directory,
    plugins: [
        angular({ tsconfig: resolve(directory, 'tsconfig.json') }),
        {
            name: 'portal-hydration-audit-ssr',
            generateBundle() {
                const runtime = [
                    'packages/primitives/core/src/id-generator.ts',
                    'packages/primitives/core/src/item-helpers.ts',
                    'packages/primitives/accordion/src/accordion-root.directive.ts',
                    'packages/primitives/accordion/src/accordion-item.directive.ts',
                    'packages/primitives/accordion/src/accordion-panel.directive.ts',
                    'packages/primitives/accordion/src/accordion-panel-presence.directive.ts',
                    'packages/primitives/accordion/src/accordion-trigger.directive.ts',
                    'packages/primitives/radio/src/radio-root.directive.ts',
                    'packages/primitives/radio/src/radio-field.ts',
                    'packages/primitives/radio/src/radio-item.directive.ts',
                    'packages/primitives/radio/src/radio-item-input.directive.ts',
                    'packages/primitives/radio/src/radio-input-ref.ts',
                    'packages/primitives/radio/src/radio-indicator.directive.ts',
                    'packages/primitives/radio/src/radio-indicator-presence.directive.ts',
                    'packages/primitives/checkbox/src/checkbox-root.ts',
                    'packages/primitives/checkbox/src/checkbox-group.ts',
                    'packages/primitives/checkbox/src/checkbox-button.ts',
                    'packages/primitives/checkbox/src/checkbox-input.ts',
                    'packages/primitives/checkbox/src/checkbox-field.ts',
                    'packages/primitives/field/src/field-root.ts',
                    'packages/primitives/field/src/field-description-ids.ts',
                    'packages/primitives/field/src/field-item.ts',
                    'packages/primitives/field/src/field-label.ts',
                    'packages/primitives/fieldset/src/fieldset-legend.ts',
                    'packages/primitives/fieldset/src/fieldset-root.ts',
                    'packages/primitives/form/src/form-root.ts',
                    'packages/primitives/collapsible/src/collapsible-root.directive.ts',
                    'packages/primitives/collapsible/src/collapsible-panel.directive.ts',
                    'packages/primitives/collapsible/src/collapsible-panel-owner-context.ts',

                    'packages/primitives/core/src/view-anchor.ts',
                    'packages/primitives/core/src/floating/internal-backdrop.ts',
                    'packages/primitives/presence/src/use-presence.ts',
                    'packages/primitives/portal/src/portal.ts',
                    'packages/primitives/portal/src/portal-presence.ts',
                    'packages/primitives/portal/src/move-nodes.ts',
                    'packages/primitives/portal/src/portal-context.ts',
                    'packages/primitives/floating-focus-manager/src/floating-focus-manager.ts',
                    'packages/primitives/floating-focus-manager/src/trigger-interaction.ts'
                ];
                const fixture = [
                    'app.ts',
                    'lazy-view.ts',
                    'radio-view.ts',
                    'checkbox-view.ts',
                    'settings.ts',
                    'client.ts',
                    'server.ts',
                    'index.html'
                ].map((file) => `apps/radix-ssr-testing/hydration-audit/${file}`);
                const hashes = (files: string[]) =>
                    Object.fromEntries(
                        files.map((file) => [file, createHash('sha256').update(readFileSync(file)).digest('hex')])
                    );
                this.emitFile({
                    type: 'asset',
                    fileName: 'audit-build.json',
                    source: JSON.stringify({
                        revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
                        phase,
                        angular: JSON.parse(readFileSync('node_modules/@angular/core/package.json', 'utf8')).version,
                        runtime: hashes(runtime),
                        fixture: hashes(fixture)
                    })
                });
            },
            configurePreviewServer(server) {
                server.middlewares.use(async (request, response, next) => {
                    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
                    if (url.pathname !== '/') return next();
                    try {
                        const document = await readFile(resolve(output, 'browser/index.html'), 'utf8');
                        const { renderAudit } = await import(pathToFileURL(resolve(output, 'server/server.mjs')).href);
                        response.setHeader('Content-Type', 'text/html; charset=utf-8');
                        response.end(await renderAudit(document, url.href));
                    } catch (error) {
                        next(error);
                    }
                });
            }
        }
    ],
    resolve: { tsconfigPaths: true },
    build: {
        outDir: resolve(output, 'browser'),
        emptyOutDir: true,
        minify: false,
        sourcemap: true
    },
    preview: { host: '127.0.0.1', port: Number(process.env.PORTAL_AUDIT_PORT ?? 4491), strictPort: true }
});
