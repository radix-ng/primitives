import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxCompositeDefaultComponent } from './composite-default';
import defaultSource from './composite-default?raw';
import { RdxCompositeListOnlyComponent } from './composite-list-only';
import listOnlySource from './composite-list-only?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: { code, language: 'typescript' }
    }
});

export default {
    title: 'Utilities/Composite',
    decorators: [
        moduleMetadata({
            imports: [RdxCompositeDefaultComponent, RdxCompositeListOnlyComponent]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <rdx-composite-default />
        `
    })
};

export const ListOnly: Story = {
    parameters: source(listOnlySource),
    render: () => ({
        template: html`
            <rdx-composite-list-only />
        `
    })
};
