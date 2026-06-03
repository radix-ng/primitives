import { RdxLabelDirective } from '../../label';
import { demoCheckbox } from '../../storybook/styles';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';
import { CheckboxReactiveFormsExampleComponent } from './checkbox-forms';
// Full component source for the "Show code" panel (Vite `?raw` import).
import formsSource from './checkbox-forms?raw';
import { CheckboxGroupExample } from './checkbox-group';
import groupSource from './checkbox-group?raw';
import { CheckboxIndeterminate } from './checkbox-indeterminate';
import indeterminateSource from './checkbox-indeterminate?raw';
import { CheckboxNgModelExample } from './checkbox-ngmodel';
import ngModelSource from './checkbox-ngmodel?raw';
import { CheckboxKeepMountedExample } from './checkbox-presence';
import presenceSource from './checkbox-presence?raw';
import { CheckboxSelectAllExample } from './checkbox-select-all';
import selectAllSource from './checkbox-select-all?raw';
import { CheckboxValidationExample } from './checkbox-validation';
import validationSource from './checkbox-validation?raw';
import { LucideCheck } from '@lucide/angular';
import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';

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
                RdxLabelDirective,
                RdxCheckboxRootDirective,
                RdxCheckboxButtonDirective,
                RdxCheckboxIndicatorDirective,
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
    args: {
        readonly: false,
        disabled: false
    },

    render: (args) => ({
        props: { ...args, c: demoCheckbox },
        template: html`
            <div class="flex items-center gap-3">
                <div rdxCheckboxRoot ${argsToTemplate(args)} [checked]="true">
                    <button id="checkbox-1" [class]="c.button" rdxCheckboxButton>
                        <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="checkbox-1">
                    Accept terms and conditions.
                </label>
            </div>
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
