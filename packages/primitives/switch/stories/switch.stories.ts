import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { SwitchDefaultExample } from './switch-default';
import defaultSource from './switch-default?raw';
import { SwitchDisabledExample } from './switch-disabled';
import disabledSource from './switch-disabled?raw';
import { SwitchReactiveForms } from './switch-forms.component';
import formsSource from './switch-forms.component?raw';
import { SwitchPreselectionExample } from './switch-preselection';
import preselectionSource from './switch-preselection?raw';
import { SwitchReadonlyExample } from './switch-readonly';
import readonlySource from './switch-readonly?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Primitives/Switch',
    decorators: [
        moduleMetadata({
            imports: [
                SwitchDefaultExample,
                SwitchPreselectionExample,
                SwitchDisabledExample,
                SwitchReadonlyExample,
                SwitchReactiveForms
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
            <switch-default-example />
        `
    })
};

export const Preselection: Story = {
    parameters: source(preselectionSource),
    render: () => ({
        template: html`
            <switch-preselection-example />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledSource),
    render: () => ({
        template: html`
            <switch-disabled-example />
        `
    })
};

export const Readonly: Story = {
    parameters: source(readonlySource),
    render: () => ({
        template: html`
            <switch-readonly-example />
        `
    })
};

export const ReactiveForm: Story = {
    parameters: source(formsSource),
    render: () => ({
        template: html`
            <switch-reactive-forms />
        `
    })
};
