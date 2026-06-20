import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RadioDefaultComponent } from './radio-default';
import { RadioDisabledComponent } from './radio-disabled';
import { RadioTemplateDrivenFormsComponent } from './radio-template-driven-forms';

import defaultSource from './radio-default?raw';
import disabledSource from './radio-disabled?raw';
import templateDrivenFormsSource from './radio-template-driven-forms?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

const html = String.raw;

export default {
    title: 'Primitives/Radio Group',
    decorators: [
        moduleMetadata({
            imports: [RadioDefaultComponent, RadioDisabledComponent, RadioTemplateDrivenFormsComponent]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <radio-default-example />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledSource),
    render: () => ({
        template: html`
            <radio-disabled-example />
        `
    })
};

export const TemplateDrivenForms: Story = {
    parameters: source(templateDrivenFormsSource),
    render: () => ({
        template: html`
            <radio-template-driven-forms-example />
        `
    })
};
