import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxVisuallyHiddenInputBubbleDirective } from '../src/visually-hidden-input-bubble.directive';
import { RdxVisuallyHiddenDirective } from '../src/visually-hidden.directive';

const html = String.raw;

export default {
    title: 'Utilities/Visually-HiddenInput',
    decorators: [
        moduleMetadata({
            imports: [
                RdxVisuallyHiddenDirective,
                RdxVisuallyHiddenInputBubbleDirective
            ]
        }),
        componentWrapperDecorator(
            (story) =>
                `
                    <div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: (args) => ({
        props: args,
        template: html`
            VisuallyHiddenInputBubble
            <input rdxVisuallyHiddenInputBubble [name]="'name-1'" [value]="'value-1'" [checked]="true" />
        `
    })
};
