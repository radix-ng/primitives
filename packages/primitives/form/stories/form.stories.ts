import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { FormDefaultExample } from './form-default';
import defaultSource from './form-default?raw';
import { FormNativeControlsExample } from './form-native-controls';
import nativeControlsSource from './form-native-controls?raw';
import { FormReactiveFormsExample } from './form-reactive-forms';
import reactiveFormsSource from './form-reactive-forms?raw';
import { FormResetExample } from './form-reset';
import resetSource from './form-reset?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const html = String.raw;

const source = (code: string) => ({
    docs: { source: { code, language: 'typescript' } }
});

export default {
    title: 'Primitives/Form',
    decorators: [
        moduleMetadata({
            imports: [FormDefaultExample, FormResetExample, FormReactiveFormsExample, FormNativeControlsExample]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <form-default-example />
        `
    })
};

export const Reset: Story = {
    parameters: source(resetSource),
    render: () => ({
        template: html`
            <form-reset-example />
        `
    })
};

export const ReactiveForms: Story = {
    parameters: source(reactiveFormsSource),
    render: () => ({
        template: html`
            <form-reactive-forms-example />
        `
    })
};

export const NativeControls: Story = {
    parameters: source(nativeControlsSource),
    render: () => ({
        template: html`
            <form-native-controls-example />
        `
    })
};
