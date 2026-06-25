import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../storybook/tailwind-demo';
import { SignalFormsArray } from './signal-forms-array';
import arraySource from './signal-forms-array?raw';
import { SignalFormsBugReport } from './signal-forms-bug-report';
import bugReportSource from './signal-forms-bug-report?raw';
import { SignalFormsComplex } from './signal-forms-complex';
import complexSource from './signal-forms-complex?raw';

const html = String.raw;
const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Recipes/Forms/Signal Forms',
    decorators: [moduleMetadata({ imports: [SignalFormsBugReport, SignalFormsComplex, SignalFormsArray] })]
} as Meta;

type Story = StoryObj;

export const BugReport: Story = {
    parameters: source(bugReportSource),
    decorators: [tailwindDemoDecorator()],
    render: () => ({
        template: html`
            <signal-forms-bug-report />
        `
    })
};

export const Complex: Story = {
    parameters: source(complexSource),
    decorators: [tailwindDemoDecorator({ size: 'tall' })],
    render: () => ({
        template: html`
            <signal-forms-complex />
        `
    })
};

export const ArrayFields: Story = {
    parameters: source(arraySource),
    decorators: [tailwindDemoDecorator({ size: 'tall' })],
    render: () => ({
        template: html`
            <signal-forms-array />
        `
    })
};
