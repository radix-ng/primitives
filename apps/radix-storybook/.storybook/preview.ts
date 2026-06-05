import { provideZonelessChangeDetection } from '@angular/core';
import {
    LucideAlignCenter,
    LucideAlignLeft,
    LucideAlignRight,
    LucideBold,
    LucideCheck,
    LucideChevronDown,
    LucideChevronLeft,
    LucideChevronRight,
    LucideChevronsLeft,
    LucideChevronsRight,
    LucideChevronUp,
    LucideDot,
    LucideItalic,
    LucideLoaderCircle,
    LucideMenu,
    LucideMinus,
    LucideMountainSnow,
    LucidePlus,
    LucideSave,
    LucideStrikethrough,
    LucideUnfoldVertical,
    LucideX,
    provideLucideIcons
} from '@lucide/angular';
import { applicationConfig, Preview } from '@storybook/angular';
import CompodocPlugin from './plugins/compodoc';

import { installRdxDirectiveHighlight } from './highlight-rdx-directives';
import './rdx-directive-highlight.css';
import { light } from './themes';

installRdxDirectiveHighlight();

CompodocPlugin.init();

const preview: Preview = {
    globalTypes: {
        theme: {
            description: 'Global theme for component examples',
            toolbar: {
                title: 'Theme',
                icon: 'circlehollow',
                items: [
                    { value: 'light', title: 'Light' },
                    { value: 'dark', title: 'Dark' }
                ],
                dynamicTitle: true
            }
        }
    },

    decorators: [
        applicationConfig({
            providers: [
                provideZonelessChangeDetection(),
                provideLucideIcons(
                    LucideAlignCenter,
                    LucideAlignLeft,
                    LucideAlignRight,
                    LucideBold,
                    LucideCheck,
                    LucideChevronDown,
                    LucideChevronLeft,
                    LucideChevronRight,
                    LucideChevronUp,
                    LucideChevronsLeft,
                    LucideChevronsRight,
                    LucideDot,
                    LucideItalic,
                    LucideLoaderCircle,
                    LucideMenu,
                    LucideMinus,
                    LucideMountainSnow,
                    LucidePlus,
                    LucideSave,
                    LucideStrikethrough,
                    LucideUnfoldVertical,
                    LucideX
                )
            ]
        }),
        (Story, context) => {
            const theme = context.globals['theme'] === 'dark' ? 'dark' : 'light';
            const storyAnchor = `anchor--${context.id}`;
            const existAnchor = context.canvasElement.closest(`#${storyAnchor}`);
            const storyContainer = context.canvasElement.closest('.sbdocs');

            document.documentElement.setAttribute('data-theme', theme);

            /**
             * Fix for https://github.com/radix-ng/primitives/issues/220
             */
            context.canvasElement.closest('[scale]')?.setAttribute('style', 'height: auto !important;');

            if (!existAnchor && storyContainer) {
                storyContainer.id = storyAnchor;
            }

            return Story(context);
        }
    ],

    parameters: {
        docs: {
            theme: light,
            toc: {
                contentsSelector: '.sbdocs-content',
                headingSelector: 'h2, h3',
                // `.docs-story *` is Storybook's default — it keeps headings rendered *inside* a
                // story preview (e.g. Accordion demos use real <h3> headers) out of the TOC.
                // Keep it (plus the Primary block) so only MDX prose headings appear.
                ignoreSelector: '#primary, .docs-story *',
                title: 'On this page',
                disable: false,
                unsafeTocbotOptions: {
                    orderedList: false
                }
            },

            codePanel: true,
            // Drop the demo wrapper decorator from the "Show code" snippet.
            source: { excludeDecorators: true }
        },
        viewport: {
            defaultViewport: 'desktop',
            viewports: {
                mobile: {
                    name: 'Mobile',
                    styles: { width: '390px', height: '844px' }
                },
                tablet: {
                    name: 'Tablet',
                    styles: { width: '768px', height: '1024px' }
                },
                desktop: {
                    name: 'Desktop',
                    styles: { width: '1280px', height: '900px' }
                }
            }
        },
        options: {
            storySort: {
                method: 'alphabetical',
                order: ['Overview', ['Introduction', 'Installation'], 'Guides', 'Primitives', 'Utilities']
            }
        }
    },

    initialGlobals: {
        theme: 'light'
    },

    tags: ['autodocs']
};

export default preview;
