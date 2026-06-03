import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { InjectIdExample } from './inject-id';
import injectIdSource from './inject-id?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Utilities/injectId',
    decorators: [
        moduleMetadata({
            imports: [InjectIdExample]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(injectIdSource),
    render: () => ({
        template: html`
            <inject-id-example />
        `
    })
};
