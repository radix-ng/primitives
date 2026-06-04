import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxContextMenuDefaultComponent } from './context-menu-default';
import defaultSource from './context-menu-default?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: { code, language: 'typescript' }
    }
});

export default {
    title: 'Primitives/Context Menu',
    decorators: [moduleMetadata({ imports: [RdxContextMenuDefaultComponent] }), tailwindDemoDecorator()]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <rdx-context-menu-default />
        `
    })
};
