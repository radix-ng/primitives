import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxContextMenuAreasComponent } from './context-menu-areas';
import areasSource from './context-menu-areas?raw';
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
    decorators: [
        moduleMetadata({ imports: [RdxContextMenuDefaultComponent, RdxContextMenuAreasComponent] }),
        tailwindDemoDecorator()
    ]
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

export const MultipleAreas: Story = {
    parameters: source(areasSource),
    render: () => ({
        template: html`
            <rdx-context-menu-areas />
        `
    })
};

export const NestedAreas: Story = {
    parameters: source(areasSource),
    render: () => ({
        template: html`
            <rdx-context-menu-areas [nested]="true" />
        `
    })
};
