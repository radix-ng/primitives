import angular from '@analogjs/astro-angular';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import AutoImport from 'astro-auto-import';
import astroExpressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';

/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const codeOptions = {
    styleOverrides: {
        borderWidth: '1px',
        frames: {
            terminalTitlebarDotsOpacity: '1',
            frameBoxShadowCssValue: 'none'
        }
    }
};

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
                './src/components/mdx/PropsTable.astro',
                './src/components/mdx/Description.astro',
                './src/components/demo-preview/ComponentPreview.astro'
            ]
        }),
        astroExpressiveCode(codeOptions),
        mdx(),
        angular()

    ]
});
