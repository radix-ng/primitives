import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { RdxTextareaDirective } from '../src/textarea.directive';

export default {
    title: 'Primitives/Textarea',
    decorators: [
        moduleMetadata({
            imports: [RdxTextareaDirective]
        }),
        componentWrapperDecorator(
            (story) =>
                `<div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}

                      </div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `
<style>
    .rt-TextAreaRoot {
        width: 300px;
    }
</style>
        <div class="form-field rt-TextAreaRoot rt-r-size-2 rt-variant-surface">
            <textarea
                rdxTextarea
                placeholder="Reply to comment…"
                class="rt-reset rt-TextAreaInput"
                [ngModelOptions]="{ standalone: true }"
            ></textarea>
        </div>


`
    })
};
