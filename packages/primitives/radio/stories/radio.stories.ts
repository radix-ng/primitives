import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RadioDefaultComponent } from './radio-default';
import { RadioDisabledComponent } from './radio-disabled';
import { RadioGroupComponent } from './radio-group.component';

import defaultSource from './radio-default?raw';
import disabledSource from './radio-disabled?raw';
import templateDrivenFormsSource from './radio-group.component?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

const html = String.raw;

export default {
    title: 'Primitives/Radio Group',
    decorators: [
        moduleMetadata({
            imports: [RadioDefaultComponent, RadioDisabledComponent, RadioGroupComponent]
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
            <radio-groups-forms-example />
        `
    })
};
