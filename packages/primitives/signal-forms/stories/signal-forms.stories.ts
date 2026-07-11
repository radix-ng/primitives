import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { SignalFormsFieldExample } from './signal-forms-field';
import fieldSource from './signal-forms-field?raw';
import { SignalFormsSubmissionExample } from './signal-forms-submission';
import submissionSource from './signal-forms-submission?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Primitives/Signal Forms',
    decorators: [
        moduleMetadata({ imports: [SignalFormsFieldExample, SignalFormsSubmissionExample] }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Field: Story = {
    parameters: source(fieldSource),
    render: () => ({
        template: html`
            <signal-forms-field-example />
        `
    })
};

export const Submission: Story = {
    parameters: source(submissionSource),
    render: () => ({
        template: html`
            <signal-forms-submission-example />
        `
    })
};
