import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxContextMenuAreasComponent } from './context-menu-areas';
import areasSource from './context-menu-areas?raw';
import { RdxContextMenuDefaultComponent } from './context-menu-default';
import defaultSource from './context-menu-default?raw';
import { RdxContextMenuRadioComponent } from './context-menu-radio';
import radioSource from './context-menu-radio?raw';
import { RdxContextMenuSidesComponent } from './context-menu-sides';
import sidesSource from './context-menu-sides?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: { code, language: 'typescript' }
    }
});

export default {
    title: 'Primitives/Context Menu',
    decorators: [
        moduleMetadata({
            imports: [
                RdxContextMenuDefaultComponent,
                RdxContextMenuRadioComponent,
                RdxContextMenuSidesComponent,
                RdxContextMenuAreasComponent
            ]
        }),
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

export const Radio: Story = {
    parameters: source(radioSource),
    render: () => ({
        template: html`
            <rdx-context-menu-radio />
        `
    })
};

export const Sides: Story = {
    parameters: source(sidesSource),
    render: () => ({
        template: html`
            <rdx-context-menu-sides />
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
