import analogjsangular from '@analogjs/astro-angular';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

import { defineConfig } from 'astro/config';
import { readFileSync } from 'fs';

function includeContentPlugin() {
    const map = new Map();

    return [
        {
            name: 'pre-include-content',
            enforce: 'pre',
            transform(code, id) {
                if (!id.includes('?includeContent')) return;
                const [filePath] = id.split('?');
                const fileContent = readFileSync(filePath, 'utf-8');

                if (map.has(filePath)) return;
                map.set(filePath, fileContent.replace(/\t/g, '  '));
            },
        },
        {
            name: 'post-include-content',
            enforce: 'post',
            transform(code, id) {
                if (!id.includes('?includeContent')) return;
                const [filePath] = id.split('?');
                const fileContent = map.get(filePath);

                return {
                    code: `
            ${code}
            export const content = ${JSON.stringify(fileContent)};
          `,
                };
            },
        },
    ];
}

// https://astro.build/config
export default defineConfig({
    vite: {
        ssr: {
            noExternal: [
                '@angular/common',
                '@angular/core',
                '@angular/core/rxjs-interop'
            ],
        },
        esbuild: {
            jsxDev: true,
        },
        plugins: [includeContentPlugin()],
    },
    integrations: [
        analogjsangular({
            vite: {
                experimental: {
                    supportAnalogFormat: true,
                },
            },
        }),
        mdx(),
        tailwind(),
    ],
});
