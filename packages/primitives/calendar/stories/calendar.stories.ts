import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CalendarDefaultComponent } from './calendar-default.component';
import { CalendarMultiple } from './calendar-multiple';
import { CalendarWithLocaleComponent } from './calendar-with-locale.component';

const html = String.raw;

export default {
    title: 'Primitives/Calendar',
    decorators: [
        moduleMetadata({
            imports: [CalendarDefaultComponent, CalendarWithLocaleComponent, CalendarMultiple]
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
            <app-calendar-default />
        `
    })
};

export const WithLocale: Story = {
    render: () => ({
        template: html`
            <app-calendar-with-locale />
        `
    })
};

export const Multiple: Story = {
    render: () => ({
        template: html`
            <app-calendar-multiple />
        `
    })
};
