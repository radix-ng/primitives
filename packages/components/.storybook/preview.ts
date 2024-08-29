import { Preview } from '@storybook/angular';

const preview: Preview = {
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
                    value: '#ffffff'
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
                order: ['Components']
            }
        }
    },

    tags: ['autodocs']
};

export default preview;
