import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Editable } from './editable';

const html = String.raw;

export default {
    title: 'Primitives/Editable',
    decorators: [
        moduleMetadata({
            imports: [Editable]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">${story}</div>
            `
        )
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
