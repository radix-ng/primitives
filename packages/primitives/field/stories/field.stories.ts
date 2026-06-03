import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { FieldCustomControlExample } from './field-custom-control';
import customControlSource from './field-custom-control?raw';
import { FieldDefaultExample } from './field-default';
import defaultSource from './field-default?raw';
import { FieldInvalidExample } from './field-invalid';
import invalidSource from './field-invalid?raw';
import { FieldReactiveFormsExample } from './field-reactive-forms';
import reactiveFormsSource from './field-reactive-forms?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Primitives/Field',
    decorators: [
        moduleMetadata({
            imports: [FieldDefaultExample, FieldInvalidExample, FieldReactiveFormsExample, FieldCustomControlExample]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <field-default-example />
        `
    })
};

export const Invalid: Story = {
    parameters: source(invalidSource),
    render: () => ({
        template: html`
            <field-invalid-example />
        `
    })
};

export const ReactiveForms: Story = {
    parameters: source(reactiveFormsSource),
    render: () => ({
        template: html`
            <field-reactive-forms-example />
        `
    })
};

export const CustomControl: Story = {
    parameters: source(customControlSource),
    render: () => ({
        template: html`
            <field-custom-control-example />
        `
    })
};
