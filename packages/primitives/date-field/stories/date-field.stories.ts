import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { DateFieldComponent } from './date-field.component';
import { DateFieldInvalid } from './date-field.invalid';

// Full component source for the "Show code" panel (Vite `?raw` import).
import demoSource from './date-field.component?raw';
import invalidSource from './date-field.invalid?raw';

const source = (code: string) => ({
    docs: {
        source: {
            code: code.trim(),
            language: 'typescript',
            type: 'code'
        }
    }
});

const html = String.raw;

export default {
    title: 'Primitives/Date Field',
    decorators: [
        moduleMetadata({
            imports: [DateFieldComponent, DateFieldInvalid]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(demoSource),
    render: () => ({
        template: html`
            <app-date-field />
        `
    })
};

export const LocalesGregorian: Story = {
    render: () => ({
        template: html`
            <app-date-field granularity="second" />
        `
    })
};

export const LocalesJapanese: Story = {
    render: () => ({
        template: html`
            <app-date-field locale="ja" granularity="second" />
        `
    })
};

export const LocalesPersian: Story = {
    render: () => ({
        template: html`
            <app-date-field locale="fa-IR" granularity="second" />
        `
    })
};

export const LocalesTaiwan: Story = {
    render: () => ({
        template: html`
            <app-date-field locale="zh-TW" granularity="second" />
        `
    })
};

export const LocalesHebrew: Story = {
    render: () => ({
        template: html`
            <app-date-field locale="he" granularity="second" />
        `
    })
};

export const LocalesRussian: Story = {
    render: () => ({
        template: html`
            <app-date-field locale="ru" granularity="second" />
        `
    })
};

export const Invalid: Story = {
    parameters: source(invalidSource),
    render: () => ({
        template: html`
            <app-date-field-invalid />
        `
    })
};
