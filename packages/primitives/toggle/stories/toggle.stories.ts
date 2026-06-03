import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxToggle } from '../src/toggle';
import { LucideItalic } from '@lucide/angular';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const html = String.raw;

const toggleClass =
    'border-border bg-background text-foreground hover:bg-muted data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50';

export default {
    title: 'Primitives/Toggle',
    decorators: [
        moduleMetadata({
            imports: [RdxToggle, LucideItalic]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <button class="${toggleClass}" rdxToggle aria-label="Toggle italic">
                <svg class="flex" lucideItalic size="12"></svg>
            </button>
        `
    })
};

export const Pressed: Story = {
    render: () => ({
        template: html`
            <button class="${toggleClass}" rdxToggle defaultPressed aria-label="Toggle italic">
                <svg class="flex" lucideItalic size="12"></svg>
            </button>
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        template: html`
            <button class="${toggleClass}" rdxToggle disabled aria-label="Toggle italic">
                <svg class="flex" lucideItalic size="12"></svg>
            </button>
        `
    })
};

export const Controlled: Story = {
    render: () => ({
        props: { pressed: false },
        template: html`
            <div class="flex flex-col items-center gap-3">
                <button class="${toggleClass}" [(pressed)]="pressed" rdxToggle aria-label="Toggle italic">
                    <svg class="flex" lucideItalic size="12"></svg>
                </button>
                <span class="text-muted-foreground text-sm">pressed: {{ pressed }}</span>
            </div>
        `
    })
};
