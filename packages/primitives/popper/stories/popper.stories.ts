import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxPopper } from '../src/popper';
import { RdxPopperAnchor } from '../src/popper-anchor';
import { RdxPopperArrow } from '../src/popper-arrow';
import { RdxPopperContent } from '../src/popper-content';
import { RdxPopperContentWrapper } from '../src/popper-content-wrapper';
import { PopperFollowPointer, PopperUpdPosition } from './popper';

const html = String.raw;

export default {
    title: 'Primitives/Popper',
    decorators: [
        moduleMetadata({
            imports: [
                RdxPopper,
                RdxPopperArrow,
                RdxPopperContentWrapper,
                RdxPopperContent,
                RdxPopperAnchor,
                PopperUpdPosition,
                PopperFollowPointer
            ]
        }),
        tailwindDemoDecorator()
    ],
    argTypes: {
        align: {
            options: ['start', 'center', 'end'],
            control: { type: 'select' }
        },
        side: {
            options: ['top', 'right', 'bottom', 'left'],
            control: { type: 'select' }
        },
        sideOffset: {
            control: { type: 'number' }
        }
    }
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    args: {
        side: 'top',
        align: 'center',
        sideOffset: 8
    },
    render: (args) => ({
        props: args,
        template: html`
            <div
                class="border-border bg-muted flex h-48 w-80 items-center justify-center rounded-xl border border-dashed"
                rdxPopperRoot
            >
                <button
                    class="border-primary bg-primary text-primary-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-10 min-w-28 items-center justify-center rounded-lg border px-4 text-sm font-semibold shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    type="button"
                    rdxPopperAnchor
                >
                    Anchor
                </button>
                <div ${argsToTemplate(args)} rdxPopperContentWrapper>
                    <div
                        class="border-border bg-popover text-popover-foreground max-w-56 [transform-origin:var(--radix-popper-transform-origin)] rounded-lg border px-3.5 py-3 text-sm leading-5 shadow-md"
                        rdxPopperContent
                    >
                        Positioned relative to the anchor
                    </div>
                    <span class="fill-popover" rdxPopperArrow></span>
                </div>
            </div>
        `
    })
};

export const CustomArrow: Story = {
    render: () => ({
        template: html`
            <div
                class="border-border bg-muted flex h-48 w-80 items-center justify-center rounded-xl border border-dashed"
                rdxPopperRoot
            >
                <button
                    class="border-primary bg-primary text-primary-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-10 min-w-28 items-center justify-center rounded-lg border px-4 text-sm font-semibold shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    type="button"
                    rdxPopperAnchor
                >
                    Anchor
                </button>
                <div side="top" sideOffset="8" rdxPopperContentWrapper>
                    <div
                        class="border-border bg-popover text-popover-foreground max-w-56 [transform-origin:var(--radix-popper-transform-origin)] rounded-lg border px-3.5 py-3 text-sm leading-5 shadow-md"
                        rdxPopperContent
                    >
                        The arrow can project custom content
                    </div>
                    <span class="fill-popover" rdxPopperArrow>
                        <div class="bg-popover h-2.5 w-5 rounded-b-full"></div>
                    </span>
                </div>
            </div>
        `
    })
};

export const UpdatePosition: Story = {
    render: () => ({
        template: html`
            <popper-upd-position />
        `
    })
};

export const FollowPointer: Story = {
    render: () => ({
        template: html`
            <popper-follow-pointer />
        `
    })
};
