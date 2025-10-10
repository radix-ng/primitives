import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tooltipImports } from '../index';
import { TooltipSlider } from './tooltip';

const html = String.raw;

export default {
    title: 'Primitives/Tooltip2',
    decorators: [
        moduleMetadata({
            imports: [...tooltipImports, TooltipSlider]
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

                    <style></style>
                </div>
            `
        )
    ],
    argTypes: {
        side: {
            options: ['top', 'right', 'bottom', 'left'],
            control: { type: 'select' }
        },
        sideOffset: {
            control: { type: 'number' }
        },
        open: {
            control: { type: 'boolean' }
        }
    }
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    args: {
        open: true,
        sideOffset: 8,
        closeDelay: 0,
        side: 'top'
    },
    render: (args) => ({
        props: args,
        template: html`
            <ng-container rdxTooltip [closeDelay]="closeDelay">
                <button
                    class="text-violet11 shadow-blackA7 hover:bg-violet3 inline-flex h-[35px] w-[35px] items-center justify-center rounded-full bg-white shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
                    rdxTooltipTriggerV2
                >
                    +
                </button>

                <div rdxTooltipPortal [container]="tooltipContent">
                    <ng-template rdxTooltipPortalPresence #tooltipContent>
                        <div
                            class="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                            [sideOffset]="sideOffset"
                            [side]="side"
                            rdxTooltipContentWrapper
                        >
                            <div rdxTooltipContent>Add to library</div>
                            <span class="fill-white" rdxTooltipArrow></span>
                        </div>
                    </ng-template>
                </div>
            </ng-container>
        `
    })
};

export const Slider: Story = {
    render: () => ({
        template: html`
            <tooltip-slider />
        `
    })
};
