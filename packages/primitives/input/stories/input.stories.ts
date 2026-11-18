import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxInputDirective } from '@radix-ng/primitives/input';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { InputDefaultStory } from './input-default-example';
import defaultPortableSource from './input-default-example?raw';
import { InputDisabledStory } from './input-disabled-example';
import disabledPortableSource from './input-disabled-example?raw';
import { InputFieldExample } from './input-field';
import fieldSource from './input-field?raw';
import { InputReactiveFormsExample } from './input-reactive-forms';
import reactiveFormsSource from './input-reactive-forms?raw';
import { InputSignupFormExample } from './input-signup-form';
import signupFormSource from './input-signup-form?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Primitives/Input',
    decorators: [
        moduleMetadata({
            imports: [
                InputDefaultStory,
                InputDisabledStory,
                FormsModule,
                ReactiveFormsModule,
                RdxInputDirective,
                InputFieldExample,
                InputReactiveFormsExample,
                InputSignupFormExample
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
            <rdx-input-default-example />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledPortableSource),
    render: () => ({
        template: html`
            <rdx-input-disabled-example />
        `
    })
};

export const WithField: Story = {
    parameters: source(fieldSource),
    render: () => ({
        template: html`
            <input-field-example />
        `
    })
};

export const ReactiveForms: Story = {
    parameters: source(reactiveFormsSource),
    render: () => ({
        template: html`
            <input-reactive-forms-example />
        `
    })
};

export const SignupForm: Story = {
    parameters: source(signupFormSource),
    render: () => ({
        template: html`
            <input-signup-form-example />
        `
    })
};
