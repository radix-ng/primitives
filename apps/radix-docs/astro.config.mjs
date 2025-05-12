import angular from '@analogjs/astro-angular';
import alpinejs from '@astrojs/alpinejs';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { getHighlighter } from '@shikijs/compat';
import AutoImport from 'astro-auto-import';
import LlmsTXT from 'astro-llms-txt';
import { defineConfig } from 'astro/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { codeImport } from 'remark-code-import';
import rehypeCodeMetaProcessor from './plugins/rehype-code-meta-processor';
import { rehypeComponent } from './plugins/rehype-component';
import rehypeFigureProcessor from './plugins/rehype-figure-processor';
import { rehypeNpmCommand } from './plugins/rehype-npm-command';
import { siteConfig } from './src/config/site-config';

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
    theme: {
        dark: 'github-dark-dimmed',
        light: 'github-light'
    },
    getHighlighter,
    onVisitLine(node) {
        // Prevent lines from collapsing in `display: grid` mode, and allow empty
        // lines to be copy/pasted
        if (node.children.length === 0) {
            node.children = [{ type: 'text', value: ' ' }];
        }
    },
    onVisitHighlightedLine(node) {
        node.properties.className = [...(node.properties.className ?? []), 'line--highlighted'];
    },
    onVisitHighlightedChars(node) {
        node.properties.className = ['word--highlighted'];
        node.tagName = 'span';
    }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
                '@internationalized/date',
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
                '@internationalized/date',
                'lucide-angular'
            ]
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
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
                './src/components/mdx/FeatureList.astro'
            ]
        }),
        mdx(),
        angular(),
        alpinejs({ entrypoint: '/src/entrypoints/alpine' }),
        LlmsTXT()
    ],
    markdown: {
        syntaxHighlight: false,
        remarkPlugins: [codeImport],
        rehypePlugins: [
            rehypeSlug,
            rehypeComponent,
            rehypeCodeMetaProcessor,
            [rehypePrettyCode, prettyCodeOptions],
            rehypeFigureProcessor,
            rehypeNpmCommand,
            [
                rehypeAutolinkHeadings,
                {
                    properties: {
                        className: ['subheading-anchor'],
                        ariaLabel: 'Link to section'
                    }
                }
            ]
        ]
    },
    redirects: {}
});
