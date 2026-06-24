import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../storybook/tailwind-demo';
import { TanstackArray } from './tanstack-array';
import arraySource from './tanstack-array?raw';
import { TanstackBugReport } from './tanstack-bug-report';
import bugReportSource from './tanstack-bug-report?raw';
import { TanstackComplex } from './tanstack-complex';
import complexSource from './tanstack-complex?raw';

const html = String.raw;
const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Recipes/Forms/TanStack Form',
    decorators: [
        moduleMetadata({ imports: [TanstackBugReport, TanstackComplex, TanstackArray] }),
        tailwindDemoDecorator({ size: 'tall' })
    ]
} as Meta;

type Story = StoryObj;

export const BugReport: Story = {
    parameters: source(bugReportSource),
    render: () => ({
        template: html`
            <tanstack-bug-report />
        `
    })
};

export const Complex: Story = {
    parameters: source(complexSource),
    render: () => ({
        template: html`
            <tanstack-complex />
        `
    })
};

export const ArrayFields: Story = {
    parameters: source(arraySource),
    render: () => ({
        template: html`
            <tanstack-array />
        `
    })
};
