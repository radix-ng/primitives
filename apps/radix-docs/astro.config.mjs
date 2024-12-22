import angular from '@analogjs/astro-angular';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import AutoImport from 'astro-auto-import';
import astroExpressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import remarkStyled, { remarkDirectives } from './plugins/remarkStyled';
import { siteConfig } from './src/config/site-config';

/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const codeOptions = {
    themes: ['light-plus', 'vesper'],
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
    site: siteConfig.url,
    trailingSlash: 'never',
    vite: {
        optimizeDeps: {
            include: [
                '@radix-ng/primitives',
                '@radix-ng/components',
                '@angular/common',
                '@angular/core',
                '@angular/cdk',
                'classnames',
                'lucide-angular'
            ]
        },
        ssr: {
            noExternal: [
                '@radix-ng/**',
                '@angular/common',
                '@angular/core',
                '@angular/core/rxjs-interop',
                'lucide-angular'
            ]
        }
    },
    integrations: [
        tailwind({
            applyBaseStyles: false
        }),
        sitemap({
            serialize(item) {
                if (item.url === siteConfig.url) {
                    item.changefreq = 'daily';
                    item.lastmod = new Date();
                    item.priority = 1;
                } else {
                    item.changefreq = 'daily';
                    item.lastmod = new Date();
                    item.priority = 0.9;
                }
                return item;
            }
        }),
        AutoImport({
            imports: [
                './src/components/mdx/PropsTable.astro',
                './src/components/mdx/Description.astro',
                './src/components/mdx/EmitsTable.astro',
                './src/components/mdx/DataAttributesTable.astro',
                './src/components/mdx/CSSVariablesTable.astro',
                './src/components/mdx/FeatureList.astro',
                './src/components/demo-primitive-preview/ComponentPreview.astro',
                './src/components/demo-component-preview/ComponentThemesPreview.astro'
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
