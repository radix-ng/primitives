import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { NumberFieldCurrencyExample } from './number-field-currency';
import currencySource from './number-field-currency?raw';
import { NumberFieldDecimalExample } from './number-field-decimal';
import decimalSource from './number-field-decimal?raw';
import { NumberFieldDefaultExample } from './number-field-default';
import defaultSource from './number-field-default?raw';
import { NumberFieldReactiveForms } from './number-field-forms';
import formsSource from './number-field-forms?raw';
import { NumberFieldPercentageExample } from './number-field-percentage';
import percentageSource from './number-field-percentage?raw';
import { NumberFieldScrubExample } from './number-field-scrub';
import scrubSource from './number-field-scrub?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Primitives/Number Field',
    decorators: [
        moduleMetadata({
            imports: [
                NumberFieldDefaultExample,
                NumberFieldDecimalExample,
                NumberFieldPercentageExample,
                NumberFieldCurrencyExample,
                NumberFieldScrubExample,
                NumberFieldReactiveForms
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <number-field-default-example />
        `
    })
};

export const Decimal: Story = {
    parameters: source(decimalSource),
    render: () => ({
        template: html`
            <number-field-decimal-example />
        `
    })
};

export const Percentage: Story = {
    parameters: source(percentageSource),
    render: () => ({
        template: html`
            <number-field-percentage-example />
        `
    })
};

export const Currency: Story = {
    parameters: source(currencySource),
    render: () => ({
        template: html`
            <number-field-currency-example />
        `
    })
};

export const Scrub: Story = {
    parameters: source(scrubSource),
    render: () => ({
        template: html`
            <number-field-scrub-example />
        `
    })
};

export const ReactiveForms: Story = {
    parameters: source(formsSource),
    render: () => ({
        template: html`
            <number-field-reactive-forms />
        `
    })
};
