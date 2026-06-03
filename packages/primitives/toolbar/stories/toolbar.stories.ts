import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { ToolbarWithMenuExample } from './toolbar-with-menu';
import menuSource from './toolbar-with-menu?raw';
import { ToolbarWithNumberFieldExample } from './toolbar-with-number-field';
import numberFieldSource from './toolbar-with-number-field?raw';
import { ToolbarWithTooltipExample } from './toolbar-with-tooltip';
import tooltipSource from './toolbar-with-tooltip?raw';
import {
    LucideAlignCenter,
    LucideAlignLeft,
    LucideAlignRight,
    LucideBold,
    LucideItalic,
    LucideUnderline
} from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroupWithoutFocus } from '@radix-ng/primitives/toggle-group';
import { RdxToolbarButton, RdxToolbarLink, RdxToolbarRoot, RdxToolbarSeparator } from '@radix-ng/primitives/toolbar';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

const rootClass = 'border-border bg-background flex w-fit items-center gap-1 rounded-lg border p-1 shadow-sm';
const buttonClass =
    'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
const toggleClass =
    'text-muted-foreground hover:bg-muted data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2';
const separatorClass = 'bg-border mx-1 h-5 w-px';
const linkClass =
    'text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md px-1 text-sm outline-none focus-visible:ring-2';

export default {
    title: 'Primitives/Toolbar',
    decorators: [
        moduleMetadata({
            imports: [
                RdxToolbarRoot,
                RdxToolbarButton,
                RdxToolbarLink,
                RdxToolbarSeparator,
                RdxToggleGroupWithoutFocus,
                RdxToggle,
                ToolbarWithMenuExample,
                ToolbarWithTooltipExample,
                ToolbarWithNumberFieldExample,
                LucideBold,
                LucideItalic,
                LucideUnderline,
                LucideAlignLeft,
                LucideAlignCenter,
                LucideAlignRight
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        props: { alignment: ['left'] },
        template: html`
            <div class="${rootClass}" rdxToolbarRoot aria-label="Formatting options">
                <div class="flex gap-1" rdxToggleGroupWithoutFocus multiple aria-label="Text formatting">
                    <button class="${toggleClass}" rdxToggle value="bold" aria-label="Bold">
                        <svg lucideBold size="16"></svg>
                    </button>
                    <button class="${toggleClass}" rdxToggle value="italic" aria-label="Italic">
                        <svg lucideItalic size="16"></svg>
                    </button>
                    <button class="${toggleClass}" rdxToggle value="underline" aria-label="Underline">
                        <svg lucideUnderline size="16"></svg>
                    </button>
                </div>

                <div class="${separatorClass}" rdxToolbarSeparator orientation="vertical"></div>

                <div class="flex gap-1" rdxToggleGroupWithoutFocus [value]="alignment" aria-label="Text alignment">
                    <button class="${toggleClass}" rdxToggle value="left" aria-label="Align left">
                        <svg lucideAlignLeft size="16"></svg>
                    </button>
                    <button class="${toggleClass}" rdxToggle value="center" aria-label="Align center">
                        <svg lucideAlignCenter size="16"></svg>
                    </button>
                    <button class="${toggleClass}" rdxToggle value="right" aria-label="Align right">
                        <svg lucideAlignRight size="16"></svg>
                    </button>
                </div>

                <div class="${separatorClass}" rdxToolbarSeparator orientation="vertical"></div>

                <a class="${linkClass}" href="#" rdxToolbarLink>Edited 2h ago</a>
                <button
                    class="${buttonClass} bg-primary text-primary-foreground hover:bg-primary/90 ml-2"
                    rdxToolbarButton
                >
                    Share
                </button>
            </div>
        `
    })
};

export const Vertical: Story = {
    render: () => ({
        props: { alignment: ['left'] },
        template: html`
            <div
                class="${rootClass} flex-col items-stretch"
                rdxToolbarRoot
                orientation="vertical"
                aria-label="Formatting options"
            >
                <div
                    class="flex flex-col gap-1"
                    rdxToggleGroupWithoutFocus
                    [value]="alignment"
                    aria-label="Text alignment"
                >
                    <button class="${toggleClass}" rdxToggle value="left" aria-label="Align left">
                        <svg lucideAlignLeft size="16"></svg>
                    </button>
                    <button class="${toggleClass}" rdxToggle value="center" aria-label="Align center">
                        <svg lucideAlignCenter size="16"></svg>
                    </button>
                    <button class="${toggleClass}" rdxToggle value="right" aria-label="Align right">
                        <svg lucideAlignRight size="16"></svg>
                    </button>
                </div>
                <div class="bg-border mx-1 my-1 h-px" rdxToolbarSeparator orientation="horizontal"></div>
                <button class="${buttonClass}" rdxToolbarButton>Share</button>
            </div>
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        template: html`
            <div class="${rootClass}" rdxToolbarRoot aria-label="Formatting options">
                <button class="${buttonClass}" rdxToolbarButton>Bold</button>
                <button class="${buttonClass}" rdxToolbarButton disabled>Italic</button>
                <div class="${separatorClass}" rdxToolbarSeparator orientation="vertical"></div>
                <button class="${buttonClass}" rdxToolbarButton>Underline</button>
            </div>
        `
    })
};

export const WithMenu: Story = {
    parameters: source(menuSource),
    render: () => ({
        template: html`
            <toolbar-with-menu />
        `
    })
};

export const WithTooltip: Story = {
    parameters: source(tooltipSource),
    render: () => ({
        template: html`
            <toolbar-with-tooltip />
        `
    })
};

export const WithNumberField: Story = {
    parameters: source(numberFieldSource),
    render: () => ({
        template: html`
            <toolbar-with-number-field />
        `
    })
};
