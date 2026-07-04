import {
    LucideBold,
    LucideItalic,
    LucideTextAlignCenter,
    LucideTextAlignEnd,
    LucideTextAlignStart,
    LucideUnderline
} from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxToggleGroup } from '../src/toggle-group';
import { ToggleGroup } from './toggle-group';

const html = String.raw;

const groupClass = 'border-border bg-muted inline-flex rounded-md border shadow-sm';
const itemClass =
    'bg-background text-foreground hover:bg-muted data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50';

export default {
    title: 'Primitives/Toggle Group',
    decorators: [
        moduleMetadata({
            imports: [
                RdxToggleGroup,
                RdxToggle,
                ToggleGroup,
                LucideTextAlignStart,
                LucideTextAlignCenter,
                LucideTextAlignEnd,
                LucideBold,
                LucideItalic,
                LucideUnderline
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        props: { value: ['center'] },
        template: html`
            <div class="${groupClass}" [value]="value" rdxToggleGroup aria-label="Text alignment">
                <button class="${itemClass}" rdxToggle value="left" aria-label="Left aligned">
                    <svg class="flex" lucideTextAlignStart size="12"></svg>
                </button>
                <button class="${itemClass}" rdxToggle value="center" aria-label="Center aligned">
                    <svg class="flex" lucideTextAlignCenter size="12"></svg>
                </button>
                <button class="${itemClass}" rdxToggle value="right" aria-label="Right aligned">
                    <svg class="flex" lucideTextAlignEnd size="12"></svg>
                </button>
            </div>
        `
    })
};

export const Multiple: Story = {
    render: () => ({
        props: { value: ['bold', 'italic'] },
        template: html`
            <div class="${groupClass}" [value]="value" rdxToggleGroup multiple aria-label="Text formatting">
                <button class="${itemClass}" rdxToggle value="bold" aria-label="Bold">
                    <svg class="flex" lucideBold size="12"></svg>
                </button>
                <button class="${itemClass}" rdxToggle value="italic" aria-label="Italic">
                    <svg class="flex" lucideItalic size="12"></svg>
                </button>
                <button class="${itemClass}" rdxToggle value="underline" aria-label="Underline">
                    <svg class="flex" lucideUnderline size="12"></svg>
                </button>
            </div>
        `
    })
};

export const DisabledItem: Story = {
    render: () => ({
        props: { value: ['center'] },
        template: html`
            <div class="${groupClass}" [value]="value" rdxToggleGroup aria-label="Text alignment">
                <button class="${itemClass}" rdxToggle value="left" disabled aria-label="Left aligned">
                    <svg class="flex" lucideTextAlignStart size="12"></svg>
                </button>
                <button class="${itemClass}" rdxToggle value="center" aria-label="Center aligned">
                    <svg class="flex" lucideTextAlignCenter size="12"></svg>
                </button>
                <button class="${itemClass}" rdxToggle value="right" aria-label="Right aligned">
                    <svg class="flex" lucideTextAlignEnd size="12"></svg>
                </button>
            </div>
        `
    })
};

export const DisabledGroup: Story = {
    render: () => ({
        props: { value: ['center'] },
        template: html`
            <div class="${groupClass}" [value]="value" rdxToggleGroup disabled aria-label="Text alignment">
                <button class="${itemClass}" rdxToggle value="left" aria-label="Left aligned">
                    <svg class="flex" lucideTextAlignStart size="12"></svg>
                </button>
                <button class="${itemClass}" rdxToggle value="center" aria-label="Center aligned">
                    <svg class="flex" lucideTextAlignCenter size="12"></svg>
                </button>
                <button class="${itemClass}" rdxToggle value="right" aria-label="Right aligned">
                    <svg class="flex" lucideTextAlignEnd size="12"></svg>
                </button>
            </div>
        `
    })
};

export const TwoWayBinding: Story = {
    render: () => ({
        template: html`
            <toggle-group />
        `
    })
};
