import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { DateFieldComponent } from './date-field.component';
import { DateFieldLocalesGregorian } from './date-field.locales';

const html = String.raw;

export default {
    title: 'Primitives/Data Field',
    decorators: [
        moduleMetadata({
            imports: [DateFieldComponent, DateFieldLocalesGregorian]
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
            <app-date-field style="display: flex;" />
        `
    })
};

export const LocalesGregorian: Story = {
    render: () => ({
        template: html`
            <app-date-field-gregorian style="display: flex;" />
        `
    })
};
