import { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from './documentation.json';

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
        }
    }
};

export default preview;
