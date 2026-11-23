import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { ScrollAreaBothExample } from './scroll-area-both';
import { ScrollAreaDefaultExample } from './scroll-area-default';
import defaultSource from './scroll-area-default?raw';
import { ScrollAreaGradientExample } from './scroll-area-gradient';
import { ScrollAreaHorizontalExample } from './scroll-area-horizontal';
import horizontalSource from './scroll-area-horizontal?raw';
import { ScrollAreaTabsExample } from './scroll-area-tabs';

// Full component source for the "Show code" panel (Vite `?raw` import).
import bothSource from './scroll-area-both?raw';
import gradientSource from './scroll-area-gradient?raw';
import tabsSource from './scroll-area-tabs?raw';

const source = (code: string) => ({
    docs: {
        source: {
            code: code.trim(),
            language: 'typescript',
            type: 'code'
        }
    }
});

const html = String.raw;

export default {
    title: 'Primitives/Scroll Area',
    decorators: [
        moduleMetadata({
            imports: [
                ScrollAreaHorizontalExample,
                ScrollAreaDefaultExample,
                ScrollAreaBothExample,
                ScrollAreaGradientExample,
                ScrollAreaTabsExample
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({ template: '<scroll-area-default-example />' })
};

export const Horizontal: Story = {
    parameters: source(horizontalSource),
    render: () => ({ template: '<scroll-area-horizontal-example />' })
};

export const BothScrollbars: Story = {
    parameters: source(bothSource),
    render: () => ({
        template: html`
            <scroll-area-both-example />
        `
    })
};

export const GradientFade: Story = {
    parameters: source(gradientSource),
    render: () => ({
        template: html`
            <scroll-area-gradient-example />
        `
    })
};

export const CombiningWithTabs: Story = {
    parameters: source(tabsSource),
    render: () => ({
        template: html`
            <scroll-area-tabs-example />
        `
    })
};
