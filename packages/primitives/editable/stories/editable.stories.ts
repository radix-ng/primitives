import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { Editable } from './editable';

const html = String.raw;

export default {
    title: 'Primitives/Editable',
    decorators: [
        moduleMetadata({
            imports: [Editable]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <story-editable />
        `
    })
};
