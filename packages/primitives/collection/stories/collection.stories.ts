import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { List } from './collection';

const html = String.raw;

export default {
    title: 'Primitives/Collection',
    decorators: [
        moduleMetadata({
            imports: [List]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <collection-list />
        `
    })
};
