import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TimeFieldComponent } from './time-field.component';

const html = String.raw;

export default {
    title: 'Primitives/Time Field',
    decorators: [
        moduleMetadata({
            imports: [TimeFieldComponent]
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
            <app-time-field style="display: flex;" />
        `
    })
};
