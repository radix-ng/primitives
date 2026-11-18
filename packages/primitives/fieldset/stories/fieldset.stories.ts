import { ReactiveFormsModule } from '@angular/forms';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '../../field';
import { RdxInputDirective } from '../../input';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { FieldsetDefaultStory } from './fieldset-default-example';
import defaultPortableSource from './fieldset-default-example?raw';
import { FieldsetDisabledStory } from './fieldset-disabled-example';
import disabledPortableSource from './fieldset-disabled-example?raw';

import { FieldsetSignupFormExample } from './fieldset-signup-form';
import signupFormSource from './fieldset-signup-form?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Primitives/Fieldset',
    decorators: [
        moduleMetadata({
            imports: [
                FieldsetDefaultStory,
                FieldsetDisabledStory,
                ReactiveFormsModule,
                RdxFieldsetRoot,
                RdxFieldsetLegend,
                RdxFieldRoot,
                RdxFieldLabel,
                RdxFieldDescription,
                RdxFieldError,
                RdxInputDirective,
                FieldsetSignupFormExample
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultPortableSource),
    render: () => ({
        template: html`
            <rdx-fieldset-default-example />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledPortableSource),
    render: () => ({
        template: html`
            <rdx-fieldset-disabled-example />
        `
    })
};

export const SignupForm: Story = {
    parameters: source(signupFormSource),
    render: () => ({
        template: html`
            <fieldset-signup-form-example />
        `
    })
};
