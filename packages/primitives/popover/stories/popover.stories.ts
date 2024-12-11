import { provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule, MountainSnowIcon, X } from 'lucide-angular';
import { RdxPopoverModule } from '../index';
import { RdxPopoverEventsComponent } from './popover-events.components';
import { RdxPopoverPositioningComponent } from './popover-positioning.component';
import { RdxPopoverTriggeringComponent } from './popover-triggering.component';

const html = String.raw;

export default {
    title: 'Primitives/Popover',
    decorators: [
        moduleMetadata({
            imports: [
                RdxPopoverModule,
                RdxPopoverEventsComponent,
                RdxPopoverPositioningComponent,
                RdxPopoverTriggeringComponent,
                LucideAngularModule,
                LucideAngularModule.pick({ MountainSnowIcon, X })
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
                    button,
                    fieldset,
                    input {
                        all: unset;
                    }

                    .PopoverContent {
                        border-radius: 4px;
                        padding: 20px;
                        width: 260px;
                        background-color: white;
                        box-shadow:
                            hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
                            hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
                        animation-duration: 400ms;
                        animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                        will-change: transform, opacity;
                    }

                    .PopoverContent:focus {
                        box-shadow:
                            hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
                            hsl(206 22% 7% / 20%) 0px 10px 20px -15px,
                            0 0 0 2px var(--violet-7);
                    }

                    .PopoverContent[data-state='open'][data-side='top'] {
                        animation-name: slideDownAndFade;
                    }

                    .PopoverContent[data-state='open'][data-side='right'] {
                        animation-name: slideLeftAndFade;
                    }

                    .PopoverContent[data-state='open'][data-side='bottom'] {
                        animation-name: slideUpAndFade;
                    }

                    .PopoverContent[data-state='open'][data-side='left'] {
                        animation-name: slideRightAndFade;
                    }

                    .PopoverArrow {
                        fill: white;
                    }

                    .PopoverClose {
                        font-family: inherit;
                        border-radius: 100%;
                        height: 25px;
                        width: 25px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--violet-11);
                        position: absolute;
                        top: 5px;
                        right: 5px;
                    }

                    .PopoverClose:hover {
                        background-color: var(--violet-4);
                    }

                    .PopoverClose:focus {
                        box-shadow: 0 0 0 2px var(--violet-7);
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

                    .Fieldset {
                        display: flex;
                        gap: 20px;
                        align-items: center;
                    }

                    .Label {
                        font-size: 13px;
                        color: var(--violet-11);
                        width: 75px;
                    }

                    .Input {
                        width: 100%;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        flex: 1;
                        border-radius: 4px;
                        padding: 0 10px;
                        font-size: 13px;
                        line-height: 1;
                        color: var(--violet-11);
                        box-shadow: 0 0 0 1px var(--violet-7);
                        height: 25px;
                    }

                    .Input:focus {
                        box-shadow: 0 0 0 2px var(--violet-8);
                    }

                    .Text {
                        margin: 0;
                        color: var(--mauve-12);
                        font-size: 15px;
                        line-height: 19px;
                        font-weight: 500;
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
                <ng-container rdxPopoverRoot>
                    <button class="IconButton" rdxPopoverTrigger>
                        <lucide-angular size="16" name="mountain-snow-icon" style="display: flex;"></lucide-angular>
                    </button>

                    <ng-template rdxPopoverContent>
                        <div class="PopoverContent">
                            <button class="PopoverClose" rdxPopoverClose aria-label="Close">
                                <lucide-angular name="x" size="16" style="display: flex" />
                            </button>
                            <div style="display: flex; flex-direction: column; gap: 10px">
                                <p class="Text" style="margin-bottom: 10px">Dimensions</p>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="width">Width</label>
                                    <input class="Input" id="width" value="100%" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="maxWidth">Max. width</label>
                                    <input class="Input" id="maxWidth" value="300px" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="height">Height</label>
                                    <input class="Input" id="height" value="25px" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="maxHeight">Max. height</label>
                                    <input class="Input" id="maxHeight" value="none" />
                                </fieldset>
                            </div>
                            <div class="PopoverArrow" rdxPopoverArrow></div>
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
            <div class="container">
                <ng-container rdxPopoverRoot>
                    <button class="IconButton" rdxPopoverTrigger>
                        <lucide-angular size="16" name="mountain-snow-icon" style="display: flex;"></lucide-angular>
                    </button>

                    <ng-template rdxPopoverContent>
                        <div class="PopoverContent">
                            <button class="PopoverClose" rdxPopoverClose aria-label="Close">
                                <lucide-angular name="x" size="16" style="display: flex" />
                            </button>
                            <div style="display: flex; flex-direction: column; gap: 10px">
                                <p class="Text" style="margin-bottom: 10px">Dimensions</p>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="width">Width</label>
                                    <input class="Input" id="width" value="100%" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="maxWidth">Max. width</label>
                                    <input class="Input" id="maxWidth" value="300px" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="height">Height</label>
                                    <input class="Input" id="height" value="25px" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="maxHeight">Max. height</label>
                                    <input class="Input" id="maxHeight" value="none" />
                                </fieldset>
                            </div>
                            <div class="PopoverArrow" rdxPopoverArrow></div>
                        </div>
                    </ng-template>
                </ng-container>
            </div>

            <div class="container">
                <ng-container rdxPopoverRoot>
                    <button class="IconButton" rdxPopoverTrigger>
                        <lucide-angular size="16" name="mountain-snow-icon" style="display: flex;"></lucide-angular>
                    </button>

                    <ng-template rdxPopoverContent [sideOffset]="16" [alignOffset]="16">
                        <div class="PopoverContent">
                            <button class="PopoverClose" rdxPopoverClose aria-label="Close">
                                <lucide-angular name="x" size="16" style="display: flex" />
                            </button>
                            <div style="display: flex; flex-direction: column; gap: 10px">
                                <p class="Text" style="margin-bottom: 10px">Dimensions</p>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="width">Width</label>
                                    <input class="Input" id="width" value="100%" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="maxWidth">Max. width</label>
                                    <input class="Input" id="maxWidth" value="300px" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="height">Height</label>
                                    <input class="Input" id="height" value="25px" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="maxHeight">Max. height</label>
                                    <input class="Input" id="maxHeight" value="none" />
                                </fieldset>
                            </div>
                            <div class="PopoverArrow" rdxPopoverArrow></div>
                        </div>
                    </ng-template>
                </ng-container>
            </div>

            <div class="container">
                <ng-container rdxPopoverRoot>
                    <button class="IconButton" rdxPopoverTrigger>
                        <lucide-angular size="16" name="mountain-snow-icon" style="display: flex;"></lucide-angular>
                    </button>

                    <ng-template rdxPopoverContent [sideOffset]="60" [alignOffset]="60">
                        <div class="PopoverContent">
                            <button class="PopoverClose" rdxPopoverClose aria-label="Close">
                                <lucide-angular name="x" size="16" style="display: flex" />
                            </button>
                            <div style="display: flex; flex-direction: column; gap: 10px">
                                <p class="Text" style="margin-bottom: 10px">Dimensions</p>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="width">Width</label>
                                    <input class="Input" id="width" value="100%" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="maxWidth">Max. width</label>
                                    <input class="Input" id="maxWidth" value="300px" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="height">Height</label>
                                    <input class="Input" id="height" value="25px" />
                                </fieldset>
                                <fieldset class="Fieldset">
                                    <label class="Label" for="maxHeight">Max. height</label>
                                    <input class="Input" id="maxHeight" value="none" />
                                </fieldset>
                            </div>
                            <div class="PopoverArrow" rdxPopoverArrow></div>
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
            <rdx-popover-events></rdx-popover-events>
        `
    })
};

export const Positioning: Story = {
    render: () => ({
        template: html`
            <rdx-popover-positioning></rdx-popover-positioning>
        `
    })
};

export const ExternalTriggering: Story = {
    render: () => ({
        template: html`
            <rdx-popover-triggering></rdx-popover-triggering>
        `
    })
};
