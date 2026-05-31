import { argsToTemplate, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
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
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="flex h-[500px] items-center justify-center gap-20 rounded-xl border border-gray-300 p-8"
                    data-demo="tailwind"
                >
                    ${story}
                </div>
            `
        )
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
                class="flex h-48 w-80 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50"
                rdxPopperRoot
            >
                <button
                    class="inline-flex h-10 min-w-28 items-center justify-center rounded-lg border border-black bg-black px-4 text-sm font-semibold text-white shadow-sm"
                    type="button"
                    rdxPopperAnchor
                >
                    Anchor
                </button>
                <div ${argsToTemplate(args)} rdxPopperContentWrapper>
                    <div
                        class="max-w-56 rounded-lg bg-gray-950 px-3.5 py-3 text-sm leading-5 text-white shadow-xl [transform-origin:var(--radix-popper-transform-origin)]"
                        rdxPopperContent
                    >
                        Positioned relative to the anchor
                    </div>
                    <span class="fill-gray-950" rdxPopperArrow></span>
                </div>
            </div>
        `
    })
};

export const CustomArrow: Story = {
    render: () => ({
        template: html`
            <div
                class="flex h-48 w-80 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50"
                rdxPopperRoot
            >
                <button
                    class="inline-flex h-10 min-w-28 items-center justify-center rounded-lg border border-black bg-black px-4 text-sm font-semibold text-white shadow-sm"
                    type="button"
                    rdxPopperAnchor
                >
                    Anchor
                </button>
                <div side="top" sideOffset="8" rdxPopperContentWrapper>
                    <div
                        class="max-w-56 rounded-lg bg-gray-950 px-3.5 py-3 text-sm leading-5 text-white shadow-xl [transform-origin:var(--radix-popper-transform-origin)]"
                        rdxPopperContent
                    >
                        The arrow can project custom content
                    </div>
                    <span class="fill-gray-950" rdxPopperArrow>
                        <div class="h-2.5 w-5 rounded-b-full bg-gray-950"></div>
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
