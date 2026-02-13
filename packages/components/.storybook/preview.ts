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
            options: {
                blue: {
                    name: 'blue',
                    value: '#ffffff'
                },

                white: {
                    name: 'white',
                    value: '#ffffff'
                }
            }
        },
        options: {
            storySort: {
                method: 'alphabetical',
                order: ['Components']
            }
        }
    },

    tags: ['autodocs'],

    initialGlobals: {
        backgrounds: {
            value: 'blue'
        }
    }
};

export default preview;
