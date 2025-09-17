import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Preview } from '@storybook/angular';
import docJson from './documentation.json';

setCompodocJson(docJson);

const preview: Preview = {
    decorators: [
        (Story, context) => {
            const storyAnchor = `anchor--${context.id}`;
            const existAnchor = context.canvasElement.closest(`#${storyAnchor}`);
            const storyContainer = context.canvasElement.closest('.sbdocs');

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

            codePanel: true
        },
        backgrounds: {
            options: {
                dark: { name: 'Dark', value: '#333' },
                light: { name: 'Light', value: '#F7F9F2' },
                blue: {
                    name: 'Radix',
                    value: 'linear-gradient(330deg,color(display-p3 0.523 0.318 0.751) 0,color(display-p3 0.276 0.384 0.837) 100%)'
                }
            }
        },
        options: {
            storySort: {
                method: 'alphabetical',
                order: ['Overview', ['Introduction', 'Installation'], 'Primitives']
            }
        }
    },

    initialGlobals: {
        backgrounds: { value: 'blue' }
    },

    tags: ['autodocs']
};

export default preview;
