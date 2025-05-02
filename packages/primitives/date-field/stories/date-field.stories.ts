import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { DateFieldComponent } from './date-field.component';
import { DateFieldInvalid } from './date-field.invalid';
import {
    DateFieldLocalesGregorian,
    DateFieldLocalesHebrew,
    DateFieldLocalesJapanese,
    DateFieldLocalesPersian,
    DateFieldLocalesRussian,
    DateFieldLocalesTaiwan
} from './date-field.locales';

const html = String.raw;

export default {
    title: 'Primitives/Date Field',
    decorators: [
        moduleMetadata({
            imports: [
                DateFieldComponent,
                DateFieldLocalesGregorian,
                DateFieldLocalesJapanese,
                DateFieldLocalesPersian,
                DateFieldLocalesTaiwan,
                DateFieldLocalesHebrew,
                DateFieldLocalesRussian,
                DateFieldInvalid
            ]
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

export const LocalesJapanese: Story = {
    render: () => ({
        template: html`
            <app-date-field-japanese style="display: flex;" />
        `
    })
};

export const LocalesPersian: Story = {
    render: () => ({
        template: html`
            <app-date-field-persian style="display: flex;" />
        `
    })
};

export const LocalesTaiwan: Story = {
    render: () => ({
        template: html`
            <app-date-field-taiwan style="display: flex;" />
        `
    })
};

export const LocalesHebrew: Story = {
    render: () => ({
        template: html`
            <app-date-field-hebrew style="display: flex;" />
        `
    })
};

export const LocalesRussian: Story = {
    render: () => ({
        template: html`
            <app-date-field-russian style="display: flex;" />
        `
    })
};

export const Invalid: Story = {
    render: () => ({
        template: html`
            <app-date-field-invalid style="display: flex;" />
        `
    })
};
