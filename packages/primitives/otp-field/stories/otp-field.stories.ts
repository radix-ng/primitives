import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { OtpFieldDefaultExample } from './otp-field-default';
import defaultSource from './otp-field-default?raw';
import { OtpFieldReactiveFormsExample } from './otp-field-forms';
import formsSource from './otp-field-forms?raw';
import { OtpFieldGroupsExample } from './otp-field-groups';
import groupsSource from './otp-field-groups?raw';
import { OtpFieldMaskExample } from './otp-field-mask';
import maskSource from './otp-field-mask?raw';
import { OtpFieldNgModelExample } from './otp-field-ngmodel';
import ngModelSource from './otp-field-ngmodel?raw';
import { OtpFieldNormalizeExample } from './otp-field-normalize';
import normalizeSource from './otp-field-normalize?raw';
import { OtpFieldPlaceholderExample } from './otp-field-placeholder';
import placeholderSource from './otp-field-placeholder?raw';
import { OtpFieldSignalFormsExample } from './otp-field-signal-forms';
import signalFormsSource from './otp-field-signal-forms?raw';
import { OtpFieldValidationExample } from './otp-field-validation';
import validationSource from './otp-field-validation?raw';

const html = String.raw;
const source = (code: string) => ({ docs: { source: { code: code.trim(), language: 'typescript', type: 'code' } } });

export default {
    title: 'Primitives/OTP Field',
    decorators: [
        moduleMetadata({
            imports: [
                OtpFieldDefaultExample,
                OtpFieldGroupsExample,
                OtpFieldValidationExample,
                OtpFieldNormalizeExample,
                OtpFieldPlaceholderExample,
                OtpFieldMaskExample,
                OtpFieldReactiveFormsExample,
                OtpFieldNgModelExample,
                OtpFieldSignalFormsExample
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
            <rdx-otp-field-default-example />
        `
    })
};

export const GroupsAndSeparator: Story = {
    parameters: source(groupsSource),
    render: () => ({
        template: html`
            <rdx-otp-field-groups-example />
        `
    })
};

export const Validation: Story = {
    parameters: source(validationSource),
    render: () => ({
        template: html`
            <rdx-otp-field-validation-example />
        `
    })
};

export const UppercaseNormalization: Story = {
    parameters: source(normalizeSource),
    render: () => ({
        template: html`
            <rdx-otp-field-normalize-example />
        `
    })
};

export const Placeholder: Story = {
    parameters: source(placeholderSource),
    render: () => ({
        template: html`
            <rdx-otp-field-placeholder-example />
        `
    })
};

export const Mask: Story = {
    parameters: source(maskSource),
    render: () => ({
        template: html`
            <rdx-otp-field-mask-example />
        `
    })
};

export const ReactiveForms: Story = {
    parameters: source(formsSource),
    render: () => ({
        template: html`
            <rdx-otp-field-reactive-forms-example />
        `
    })
};

export const TemplateDrivenForms: Story = {
    parameters: source(ngModelSource),
    render: () => ({
        template: html`
            <rdx-otp-field-ngmodel-example />
        `
    })
};

export const SignalForms: Story = {
    parameters: source(signalFormsSource),
    render: () => ({
        template: html`
            <rdx-otp-field-signal-forms-example />
        `
    })
};
