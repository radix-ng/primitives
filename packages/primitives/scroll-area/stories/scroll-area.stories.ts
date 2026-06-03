import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import {
    RdxScrollAreaContent,
    RdxScrollAreaCorner,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '../index';
import { ScrollAreaBothExample } from './scroll-area-both';
// Full component source for the "Show code" panel (Vite `?raw` import).
import bothSource from './scroll-area-both?raw';
import { ScrollAreaGradientExample } from './scroll-area-gradient';
import gradientSource from './scroll-area-gradient?raw';
import { ScrollAreaTabsExample } from './scroll-area-tabs';
import tabsSource from './scroll-area-tabs?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

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
                RdxScrollAreaRoot,
                RdxScrollAreaViewport,
                RdxScrollAreaContent,
                RdxScrollAreaScrollbar,
                RdxScrollAreaThumb,
                RdxScrollAreaCorner,
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
    render: () => ({
        props: { tags: Array.from({ length: 50 }, (_, i) => `v1.2.0-beta.${i + 1}`) },
        template: html`
            <div class="border-border bg-background h-64 w-56 overflow-hidden rounded-md border" rdxScrollAreaRoot>
                <div class="h-full w-full rounded-[inherit]" rdxScrollAreaViewport>
                    <div class="p-4" rdxScrollAreaContent>
                        <div class="text-foreground mb-2 text-sm font-medium">Tags</div>
                        @for (tag of tags; track tag) {
                        <div class="border-border text-foreground border-t py-1.5 text-sm">{{ tag }}</div>
                        }
                    </div>
                </div>

                <div class="flex w-2.5 touch-none p-0.5 select-none" rdxScrollAreaScrollbar orientation="vertical">
                    <div
                        class="bg-foreground/30 hover:bg-foreground/50 w-full rounded-full transition-colors"
                        rdxScrollAreaThumb
                    ></div>
                </div>
            </div>
        `
    })
};

export const Horizontal: Story = {
    render: () => ({
        props: { items: Array.from({ length: 16 }, (_, i) => i + 1) },
        template: html`
            <div class="border-border bg-background w-80 overflow-hidden rounded-md border" rdxScrollAreaRoot>
                <div class="w-full rounded-[inherit]" rdxScrollAreaViewport>
                    <div class="flex gap-3 p-3" rdxScrollAreaContent>
                        @for (item of items; track item) {
                        <figure class="shrink-0">
                            <div
                                class="bg-muted text-foreground flex h-28 w-28 items-center justify-center rounded-md text-2xl font-semibold"
                            >
                                {{ item }}
                            </div>
                        </figure>
                        }
                    </div>
                </div>

                <div class="flex h-2.5 touch-none p-0.5 select-none" rdxScrollAreaScrollbar orientation="horizontal">
                    <div
                        class="bg-foreground/30 hover:bg-foreground/50 h-full rounded-full transition-colors"
                        rdxScrollAreaThumb
                    ></div>
                </div>
            </div>
        `
    })
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
