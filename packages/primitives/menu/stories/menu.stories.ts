import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { MenuCheckboxItemsStory } from './components/menu-checkbox-items';
import { MenuRadioItemsStory } from './components/menu-radio-items';
import { MenuWithLabelsItemsStory } from './components/menu-with-labels-items';
import { RdxMenuAnimatedComponent } from './menu-animated';
import animatedSource from './menu-animated?raw';
import { RdxMenuArrowExampleComponent } from './menu-arrow';
import arrowSource from './menu-arrow?raw';
import { RdxMenuBackdropExampleComponent } from './menu-backdrop';
import backdropSource from './menu-backdrop?raw';
import { RdxMenuDefaultComponent } from './menu-default';
import defaultSource from './menu-default?raw';
import { RdxMenuNestedComponent } from './menu-nested';
import { RdxMenuNestedRtlComponent } from './menu-nested-rtl';
import nestedRtlSource from './menu-nested-rtl?raw';
import nestedSource from './menu-nested?raw';
import { RdxMenuViewportExampleComponent } from './menu-viewport';
import viewportSource from './menu-viewport?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: { code, language: 'typescript' }
    }
});

export default {
    title: 'Primitives/Menu',
    decorators: [
        moduleMetadata({
            imports: [
                RdxMenuDefaultComponent,
                RdxMenuNestedComponent,
                RdxMenuNestedRtlComponent,
                RdxMenuArrowExampleComponent,
                RdxMenuBackdropExampleComponent,
                RdxMenuAnimatedComponent,
                RdxMenuViewportExampleComponent,
                MenuRadioItemsStory,
                MenuCheckboxItemsStory,
                MenuWithLabelsItemsStory
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
            <rdx-menu-default />
        `
    })
};

export const RadioItem: Story = {
    render: () => ({
        template: html`
            <menu-radio-items-story />
        `
    })
};

export const CheckboxItem: Story = {
    render: () => ({
        template: html`
            <menu-checkbox-items-story />
        `
    })
};

export const WithLabels: Story = {
    render: () => ({
        template: html`
            <menu-with-labels-items-story />
        `
    })
};

export const Nested: Story = {
    parameters: source(nestedSource),
    render: () => ({
        template: html`
            <rdx-menu-nested />
        `
    })
};

export const NestedRtl: Story = {
    parameters: source(nestedRtlSource),
    render: () => ({
        template: html`
            <rdx-menu-nested-rtl />
        `
    })
};

export const Arrow: Story = {
    parameters: source(arrowSource),
    render: () => ({
        template: html`
            <rdx-menu-arrow />
        `
    })
};

export const Backdrop: Story = {
    parameters: source(backdropSource),
    render: () => ({
        template: html`
            <rdx-menu-backdrop />
        `
    })
};

export const Animated: Story = {
    parameters: source(animatedSource),
    render: () => ({
        template: html`
            <rdx-menu-animated />
        `
    })
};

export const Viewport: Story = {
    parameters: source(viewportSource),
    render: () => ({
        template: html`
            <rdx-menu-viewport />
        `
    })
};
