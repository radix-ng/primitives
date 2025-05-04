import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
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
            <app-number-field style="display: flex;" />
        `
    })
};

export const Decimal: Story = {
    render: () => ({
        template: html`
            <app-number-field-decimal style="display: flex;" />
        `
    })
};

export const Percentage: Story = {
    render: () => ({
        template: html`
            <app-number-field-percentage style="display: flex;" />
        `
    })
};

export const Currency: Story = {
    render: () => ({
        template: html`
            <app-number-field-currency style="display: flex;" />
        `
    })
};

export const Units: Story = {
    render: () => ({
        template: html`
            <app-number-field-units style="display: flex;" />
        `
    })
};
