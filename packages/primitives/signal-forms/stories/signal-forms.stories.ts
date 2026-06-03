import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { SignalFormsFieldExample } from './signal-forms-field';
import fieldSource from './signal-forms-field?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Primitives/Signal Forms',
    decorators: [moduleMetadata({ imports: [SignalFormsFieldExample] }), tailwindDemoDecorator()]
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
