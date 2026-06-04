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
                ignoreSelector: '#primary',
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
