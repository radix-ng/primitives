import { LucideCheck } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { CheckboxDefaultStory } from './checkbox-default-example';
import defaultPortableSource from './checkbox-default-example?raw';

import { CheckboxReactiveFormsExampleComponent } from './checkbox-forms';
import { CheckboxGroupExample } from './checkbox-group';
import { CheckboxIndeterminate } from './checkbox-indeterminate';
import { CheckboxNgModelExample } from './checkbox-ngmodel';
import { CheckboxKeepMountedExample } from './checkbox-presence';
import { CheckboxSelectAllExample } from './checkbox-select-all';
import { CheckboxValidationExample } from './checkbox-validation';

// Full component source for the "Show code" panel (Vite `?raw` import).
import formsSource from './checkbox-forms?raw';
import groupSource from './checkbox-group?raw';
import indeterminateSource from './checkbox-indeterminate?raw';
import ngModelSource from './checkbox-ngmodel?raw';
import presenceSource from './checkbox-presence?raw';
import selectAllSource from './checkbox-select-all?raw';
import validationSource from './checkbox-validation?raw';

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
    title: 'Primitives/Checkbox',
    decorators: [
        moduleMetadata({
            imports: [
                CheckboxDefaultStory,

                RdxCheckboxRootDirective,
                RdxCheckboxButtonDirective,
                RdxCheckboxIndicatorDirective,
                RdxCheckboxIndicatorPresenceDirective,
                RdxCheckboxInputDirective,
                LucideCheck,
                CheckboxReactiveFormsExampleComponent,
                CheckboxIndeterminate,
                CheckboxKeepMountedExample,
                CheckboxNgModelExample,
                CheckboxValidationExample,
                CheckboxSelectAllExample,
                CheckboxGroupExample
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultPortableSource),
    args: {
        readonly: false,
        disabled: false
    },

    render: (args) => ({
        props: { ...args },
        template: html`
            <rdx-checkbox-default-example [readOnly]="readonly" [disabled]="disabled" />
        `
    }),
    play: async ({ canvas }) => {
        await expect(canvas.getByText(/Accept terms and conditions/gi)).toBeTruthy();
    }
};

export const ReactiveForms: Story = {
    parameters: source(formsSource),
    render: () => ({
        template: html`
            <checkbox-groups-forms-example />
        `
    })
};

export const Indeterminate: Story = {
    parameters: source(indeterminateSource),
    render: () => ({
        template: html`
            <checkbox-indeterminate-example />
        `
    })
};

export const KeepMounted: Story = {
    parameters: source(presenceSource),
    render: () => ({
        template: html`
            <checkbox-keep-mounted-example />
        `
    })
};

export const TemplateDrivenForms: Story = {
    parameters: source(ngModelSource),
    render: () => ({
        template: html`
            <checkbox-ngmodel-example />
        `
    })
};

export const Validation: Story = {
    parameters: source(validationSource),
    render: () => ({
        template: html`
            <checkbox-validation-example />
        `
    })
};

export const SelectAll: Story = {
    parameters: source(selectAllSource),
    render: () => ({
        template: html`
            <checkbox-select-all-example />
        `
    })
};

export const Group: Story = {
    parameters: source(groupSource),
    render: () => ({
        template: html`
            <checkbox-group-example />
        `
    })
};
