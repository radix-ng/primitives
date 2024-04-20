import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Preview } from '@storybook/angular';

import docJson from './documentation.json';
import { badgesConfig } from './helpers/bages-config';

setCompodocJson(docJson);

const preview: Preview = {
    decorators: [
        (Story, context) => {
            const storyAnchor = `anchor--${context.id}`;
            const existAnchor = context.canvasElement.closest(`#${storyAnchor}`);
            const storyContainer = context.canvasElement.closest('.sbdocs');

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
            }
        },
        backgrounds: {
            default: 'blue',
            values: [
                {
                    name: 'blue',
                    value: 'linear-gradient(330deg,color(display-p3 0.523 0.318 0.751) 0,color(display-p3 0.276 0.384 0.837) 100%)'
                },
                {
                    name: 'white',
                    value: '#ffffff'
                }
            ]
        },
        options: {
            storySort: {
                method: 'alphabetical',
                order: ['Overview', ['Introduction', 'Installation'], 'Primitives']
            }
        },
        badgesConfig
    }
};

export default preview;
