import angular from '@analogjs/astro-angular';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import AutoImport from 'astro-auto-import';
import astroExpressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    vite: {
        optimizeDeps: {
            include: [
                '@radix-ng/primitives',
                '@angular/common',
                '@angular/core',
                '@angular/cdk'
            ]
        },
        ssr: {
            noExternal: [
                '@radix-ng/**',
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
        tailwind(),
        AutoImport({
            imports: [
                './src/components/ComponentPreview.astro',
                './src/components/mdx/Description.astro'
            ]
        }),
        astroExpressiveCode(),
        mdx(),
        angular()

    ]
});
