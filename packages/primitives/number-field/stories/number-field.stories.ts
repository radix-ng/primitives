import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import {
    NumberField,
    NumberFieldCurrency,
    NumberFieldDecimal,
    NumberFieldPercentage,
    NumberFieldUnits
} from './number-field';

const html = String.raw;

export default {
    title: 'Primitives/Number Field',
    decorators: [
        moduleMetadata({
            imports: [NumberField, NumberFieldDecimal, NumberFieldPercentage, NumberFieldCurrency, NumberFieldUnits]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <app-number-field class="flex" />
        `
    })
};

export const Decimal: Story = {
    render: () => ({
        template: html`
            <app-number-field-decimal class="flex" />
        `
    })
};

export const Percentage: Story = {
    render: () => ({
        template: html`
            <app-number-field-percentage class="flex" />
        `
    })
};

export const Currency: Story = {
    render: () => ({
        template: html`
            <app-number-field-currency class="flex" />
        `
    })
};

export const Units: Story = {
    render: () => ({
        template: html`
            <app-number-field-units class="flex" />
        `
    })
};
