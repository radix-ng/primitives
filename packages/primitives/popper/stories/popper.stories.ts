import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxPopper } from '../src/popper';
import { RdxPopperAnchor } from '../src/popper-anchor';
import { RdxPopperArrow } from '../src/popper-arrow';
import { RdxPopperContent } from '../src/popper-content';
import { RdxPopperContentWrapper } from '../src/popper-content-wrapper';
import { PopperUpdPosition } from './popper';

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
                PopperUpdPosition
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    <div
                        style="height: 500px;
                                display: flex;
                                justify-content: center;
                                gap: 80px;
                                align-items: center;
                                border: 3px dashed var(--white-a8);
                                border-radius: 12px;"
                    >
                        ${story}
                    </div>

                    <style>
                        .popper_contentClass {
                            transform-origin: var(--radix-popper-transform-origin);
                            background-color: #ccc;
                            padding: 10px;
                            border-radius: 10px;
                            width: 300px;
                            height: 150px;
                        }
                        .popper_anchorClass {
                            background-color: hotpink;
                            width: 100px;
                            height: 100px;
                        }
                        .popper_arrowClass {
                            fill: #ccc;
                        }
                        @keyframes popper_rotateIn {
                            0% {
                                transform: scale(0) rotateZ(calc(var(--direction) * 45deg));
                            }
                            100% {
                                transform: scale(1);
                            }
                        }
                        .popper_animatedContentClass {
                            animation: popper_rotateIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                        }
                        .popper_animatedContentClass[data-side='top'] {
                            --direction: 1;
                        }
                        .popper_animatedContentClass[data-side='bottom'] {
                            --direction: -1;
                        }
                    </style>
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div rdxPopperRoot>
                <div class="popper_anchorClass" rdxPopperAnchor>open</div>
                <div class="popper_contentClass" side="left" align="center" sideOffset="5" rdxPopperContentWrapper>
                    <div rdxPopperContent>Dimensions</div>
                    <div class="popper_arrowClass" rdxPopperArrow></div>
                </div>
            </div>
        `
    })
};

export const CustomArrow: Story = {
    render: () => ({
        template: html`
            <div rdxPopperRoot>
                <div class="popper_anchorClass" rdxPopperAnchor>open</div>
                <div class="popper_contentClass" side="left" align="center" rdxPopperContentWrapper>
                    <div rdxPopperContent>Dimensions</div>
                    <div class="popper_arrowClass" rdxPopperArrow>
                        <div
                            style="width: 20px; height: 10px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; background-color: tomato;"
                        ></div>
                    </div>
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
