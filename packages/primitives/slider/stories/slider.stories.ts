import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { SliderDefaultExample } from './slider-default';
import defaultSource from './slider-default?raw';
import { SliderDisabledExample } from './slider-disabled';
import disabledSource from './slider-disabled?raw';
import { SliderFormsExample } from './slider-forms';
import formsSource from './slider-forms?raw';
import { SliderRangeExample } from './slider-range';
import rangeSource from './slider-range?raw';
import { SliderThumbAlignmentExample } from './slider-thumb-alignment';
import thumbAlignmentSource from './slider-thumb-alignment?raw';
import { SliderValueExample } from './slider-value';
import valueSource from './slider-value?raw';
import { SliderVerticalExample } from './slider-vertical';
import verticalSource from './slider-vertical?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Primitives/Slider',
    decorators: [
        moduleMetadata({
            imports: [
                SliderDefaultExample,
                SliderRangeExample,
                SliderVerticalExample,
                SliderValueExample,
                SliderDisabledExample,
                SliderFormsExample,
                SliderThumbAlignmentExample
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
            <slider-default-example />
        `
    })
};

export const Range: Story = {
    parameters: source(rangeSource),
    render: () => ({
        template: html`
            <slider-range-example />
        `
    })
};

export const Vertical: Story = {
    parameters: source(verticalSource),
    render: () => ({
        template: html`
            <slider-vertical-example />
        `
    })
};

export const Value: Story = {
    parameters: source(valueSource),
    render: () => ({
        template: html`
            <slider-value-example />
        `
    })
};

export const ThumbAlignment: Story = {
    parameters: source(thumbAlignmentSource),
    render: () => ({
        template: html`
            <slider-thumb-alignment-example />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledSource),
    render: () => ({
        template: html`
            <slider-disabled-example />
        `
    })
};

export const ReactiveForms: Story = {
    parameters: source(formsSource),
    render: () => ({
        template: html`
            <slider-forms-example />
        `
    })
};
