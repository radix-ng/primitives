import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxMenubarDefaultComponent } from './menubar-default';
import defaultSource from './menubar-default?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: { code, language: 'typescript' }
    }
});

export default {
    title: 'Primitives/Menubar',
    decorators: [
        moduleMetadata({
            imports: [RdxMenubarDefaultComponent]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <rdx-menubar-default />
        `
    })
};
