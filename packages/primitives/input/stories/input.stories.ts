import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { demoInput } from '../../storybook/styles';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxInputDirective } from '../src/input.directive';
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
    render: () => ({
        props: { inputClass: demoInput },
        template: html`
            <input rdxInput [class]="inputClass" placeholder="name@example.com" />
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        props: { inputClass: demoInput },
        template: html`
            <input rdxInput disabled [class]="inputClass" defaultValue="name@example.com" />
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
