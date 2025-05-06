import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CropperDefault } from './cropper';

const html = String.raw;

export default {
    title: 'Primitives/Cropper',
    decorators: [
        moduleMetadata({
            imports: [CropperDefault]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div>
                <app-cropper-default />
            </div>
        `
    })
};
