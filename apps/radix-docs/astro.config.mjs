import analogjsangular from '@analogjs/astro-angular';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    vite: {
        ssr: {
            noExternal: [
                '@angular/common',
                '@angular/core',
                '@angular/core/rxjs-interop'
            ]
        },
        esbuild: {
            jsxDev: true
        }
    },
    integrations: [
        analogjsangular({
            vite: {
                experimental: {
                    supportAnalogFormat: true
                }
            }
        }),
        mdx(),
        tailwind()

    ]
});
