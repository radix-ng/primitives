import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { tooltipImports } from '../index';
import { TooltipSlider } from './tooltip';

const html = String.raw;

export default {
    title: 'Primitives/Tooltip2',
    decorators: [
        moduleMetadata({
            imports: [...tooltipImports, TooltipSlider, LucideAngularModule]
        }),
        tailwindDemoDecorator()
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
        disabled: false,
        sideOffset: 8,
        closeDelay: 0,
        side: 'top'
    },
    render: (args) => ({
        props: args,
        template: html`
            <ng-container rdxTooltip [open]="open" [closeDelay]="closeDelay" [disabled]="disabled">
                <button
                    class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex size-9 items-center justify-center rounded-md border shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    type="button"
                    aria-label="Add to library"
                    rdxTooltipTrigger
                    [attr.disabled]="disabled"
                >
                    <lucide-angular aria-hidden="true" name="plus" size="16" />
                </button>

                <div rdxTooltipPortal [container]="tooltipContent">
                    <ng-template rdxTooltipPortalPresence #tooltipContent>
                        <div [sideOffset]="sideOffset" [side]="side" rdxTooltipContentWrapper>
                            <div
                                class="border-border bg-popover text-popover-foreground select-none rounded-md border px-3 py-2 text-sm leading-none shadow-md"
                                rdxTooltipContent
                            >
                                Add to library
                            </div>
                            <span class="fill-popover" rdxTooltipArrow></span>
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
