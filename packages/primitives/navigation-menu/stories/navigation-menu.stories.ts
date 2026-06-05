import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxNavigationMenuCustomLinksComponent } from './navigation-menu-custom-links';
import customLinksSource from './navigation-menu-custom-links?raw';
import { RdxNavigationMenuDefaultComponent } from './navigation-menu-default';
import defaultSource from './navigation-menu-default?raw';
import { RdxNavigationMenuLargeComponent } from './navigation-menu-large';
import largeSource from './navigation-menu-large?raw';
import { RdxNavigationMenuLinksComponent } from './navigation-menu-links';
import linksSource from './navigation-menu-links?raw';
import { RdxNavigationMenuNestedComponent } from './navigation-menu-nested';
import { RdxNavigationMenuNestedInlineComponent } from './navigation-menu-nested-inline';
import nestedInlineSource from './navigation-menu-nested-inline?raw';
import nestedSource from './navigation-menu-nested?raw';
import { RdxNavigationMenuRtlComponent } from './navigation-menu-rtl';
import rtlSource from './navigation-menu-rtl?raw';
import { RdxNavigationMenuVerticalComponent } from './navigation-menu-vertical';
import verticalSource from './navigation-menu-vertical?raw';

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
    title: 'Primitives/Navigation Menu',
    decorators: [
        moduleMetadata({
            imports: [
                RdxNavigationMenuDefaultComponent,
                RdxNavigationMenuVerticalComponent,
                RdxNavigationMenuRtlComponent,
                RdxNavigationMenuLinksComponent,
                RdxNavigationMenuCustomLinksComponent,
                RdxNavigationMenuLargeComponent,
                RdxNavigationMenuNestedComponent,
                RdxNavigationMenuNestedInlineComponent
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
            <rdx-navigation-menu-default />
        `
    })
};

export const Vertical: Story = {
    parameters: source(verticalSource),
    render: () => ({
        template: html`
            <rdx-navigation-menu-vertical />
        `
    })
};

export const Rtl: Story = {
    parameters: source(rtlSource),
    render: () => ({
        template: html`
            <rdx-navigation-menu-rtl />
        `
    })
};

export const Links: Story = {
    parameters: source(linksSource),
    render: () => ({
        template: html`
            <rdx-navigation-menu-links />
        `
    })
};

export const CustomLinks: Story = {
    parameters: source(customLinksSource),
    render: () => ({
        template: html`
            <rdx-navigation-menu-custom-links />
        `
    })
};

export const LargeMenu: Story = {
    parameters: source(largeSource),
    render: () => ({
        template: html`
            <rdx-navigation-menu-large />
        `
    })
};

export const Nested: Story = {
    parameters: source(nestedSource),
    render: () => ({
        template: html`
            <rdx-navigation-menu-nested />
        `
    })
};

export const NestedInline: Story = {
    parameters: source(nestedInlineSource),
    render: () => ({
        template: html`
            <rdx-navigation-menu-nested-inline />
        `
    })
};
