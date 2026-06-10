import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../storybook/tailwind-demo';
import { SplitButtonExample } from './split-button';
import splitButtonSource from './split-button?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: {
            code,
            language: 'typescript'
        }
    }
});

export default {
    title: 'Recipes/Split Button',
    decorators: [moduleMetadata({ imports: [SplitButtonExample] }), tailwindDemoDecorator()]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(splitButtonSource),
    render: () => ({
        template: html`
            <split-button-example />
        `
    })
};
