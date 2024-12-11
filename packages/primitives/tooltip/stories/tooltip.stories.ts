import { provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { RdxTooltipModule } from '../index';
import { RdxTooltipEventsComponent } from './tooltip-events.components';
import { RdxTooltipPositioningComponent } from './tooltip-positioning.component';
import { RdxTooltipTriggeringComponent } from './tooltip-triggering.component';

const html = String.raw;

export default {
    title: 'Primitives/Tooltip',
    decorators: [
        moduleMetadata({
            imports: [
                RdxTooltipModule,
                RdxTooltipEventsComponent,
                RdxTooltipPositioningComponent,
                RdxTooltipTriggeringComponent,
                LucideAngularModule,
                LucideAngularModule.pick({ Plus })
            ],
            providers: [provideAnimations()]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>

                <style>
                    .container {
                        height: 150px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    /* reset */
                    button {
                        all: unset;
                    }

                    .TooltipContent {
                        border-radius: 4px;
                        padding: 10px 15px;
                        font-size: 15px;
                        line-height: 1;
                        color: var(--violet-11);
                        background-color: white;
                        box-shadow:
                            hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
                            hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
                        user-select: none;
                        animation-duration: 400ms;
                        animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                        will-change: transform, opacity;
                    }
                    .TooltipContent[data-state='delayed-open'][data-side='top'] {
                        animation-name: slideDownAndFade;
                    }
                    .TooltipContent[data-state='delayed-open'][data-side='right'] {
                        animation-name: slideLeftAndFade;
                    }
                    .TooltipContent[data-state='delayed-open'][data-side='bottom'] {
                        animation-name: slideUpAndFade;
                    }
                    .TooltipContent[data-state='delayed-open'][data-side='left'] {
                        animation-name: slideRightAndFade;
                    }

                    .TooltipArrow {
                        fill: white;
                    }

                    .IconButton {
                        font-family: inherit;
                        border-radius: 100%;
                        height: 35px;
                        width: 35px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--violet-11);
                        background-color: white;
                        box-shadow: 0 2px 10px var(--black-a7);
                    }
                    .IconButton:hover {
                        background-color: var(--violet-3);
                    }
                    .IconButton:focus {
                        box-shadow: 0 0 0 2px black;
                    }

                    @keyframes slideUpAndFade {
                        from {
                            opacity: 0;
                            transform: translateY(2px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes slideRightAndFade {
                        from {
                            opacity: 0;
                            transform: translateX(-2px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes slideDownAndFade {
                        from {
                            opacity: 0;
                            transform: translateY(-2px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes slideLeftAndFade {
                        from {
                            opacity: 0;
                            transform: translateX(2px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                </style>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div class="container">
                <ng-container rdxTooltipRoot>
                    <button class="IconButton" rdxTooltipTrigger>
                        <lucide-angular size="16" name="plus" style="display: flex;"></lucide-angular>
                    </button>

                    <ng-template rdxTooltipContent [sideOffset]="8">
                        <div class="TooltipContent" rdxTooltipContentAttributes>
                            Add to library
                            <div class="TooltipArrow" rdxTooltipArrow></div>
                        </div>
                    </ng-template>
                </ng-container>
            </div>
        `
    })
};

export const Multiple: Story = {
    render: () => ({
        template: html`
            <div class="container" style="gap: 40px;">
                <ng-container rdxTooltipRoot>
                    <button class="IconButton" rdxTooltipTrigger>
                        <lucide-angular size="16" name="plus" style="display: flex;"></lucide-angular>
                    </button>

                    <ng-template rdxTooltipContent [sideOffset]="60">
                        <div class="TooltipContent" rdxTooltipContentAttributes>
                            Add to library
                            <div class="TooltipArrow" rdxTooltipArrow></div>
                        </div>
                    </ng-template>
                </ng-container>

                <ng-container rdxTooltipRoot>
                    <button class="IconButton" rdxTooltipTrigger>
                        <lucide-angular size="16" name="plus" style="display: flex;"></lucide-angular>
                    </button>

                    <ng-template rdxTooltipContent [sideOffset]="8">
                        <div class="TooltipContent" rdxTooltipContentAttributes>
                            Add to library
                            <div class="TooltipArrow" rdxTooltipArrow></div>
                        </div>
                    </ng-template>
                </ng-container>

                <ng-container rdxTooltipRoot>
                    <button class="IconButton" rdxTooltipTrigger>
                        <lucide-angular size="16" name="plus" style="display: flex;"></lucide-angular>
                    </button>

                    <ng-template rdxTooltipContent [sideOffset]="1">
                        <div class="TooltipContent" rdxTooltipContentAttributes>
                            Add to library
                            <div class="TooltipArrow" rdxTooltipArrow></div>
                        </div>
                    </ng-template>
                </ng-container>
            </div>
        `
    })
};

export const Events: Story = {
    render: () => ({
        template: html`
            <rdx-tooltip-events></rdx-tooltip-events>
        `
    })
};

export const Positioning: Story = {
    render: () => ({
        template: html`
            <rdx-tooltip-positioning></rdx-tooltip-positioning>
        `
    })
};

export const ExternalTriggering: Story = {
    render: () => ({
        template: html`
            <rdx-tooltip-triggering></rdx-tooltip-triggering>
        `
    })
};
