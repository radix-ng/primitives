import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormUsageComponent } from './form-usage.component';

const html = String.raw;

export default {
    title: 'Primitives/Form',
    decorators: [
        moduleMetadata({ imports: [FormUsageComponent] }),
        componentWrapperDecorator(
            (story) => `
                <div class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div class="rt-Flex rt-r-jc-center">
                <rdx-form-usage></rdx-form-usage>
            </div>
        `
    })
};
