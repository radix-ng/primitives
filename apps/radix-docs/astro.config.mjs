import angular from '@analogjs/astro-angular';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import AutoImport from 'astro-auto-import';
import astroExpressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import remarkStyled, { remarkDirectives } from './plugins/remarkStyled';

/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const codeOptions = {
    themes: ['snazzy-light', 'github-dark'],
    styleOverrides: {
        borderWidth: '1px',
        codeFontSize: '13px',
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
                '@radix-ng/components',
                '@angular/common',
                '@angular/core',
                '@angular/cdk',
                'classnames'
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
                './src/components/mdx/DataAttributesTable.astro',
                './src/components/mdx/CSSVariablesTable.astro',
                './src/components/demo-primitive-preview/ComponentPreview.astro',
                './src/components/demo-component-preview/ComponentThemesPreview.astro',
                './src/components/marked-list/MarkedList.astro'
            ]
        }),
        astroExpressiveCode(codeOptions),
        mdx(),
        angular()

    ],
    markdown: {
        remarkPlugins: [
            remarkDirectives,
            remarkStyled
        ]
    },
    redirects: {}
});
