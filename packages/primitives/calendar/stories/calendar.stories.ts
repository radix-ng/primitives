import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxCalendarRootDirective } from '../src/calendar-root.directive';

const html = String.raw;

export default {
    title: 'Primitives/Calendar',
    decorators: [
        moduleMetadata({
            imports: [RdxCalendarRootDirective]
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
            <div rdxCalendarRoot></div>
        `
    })
};
