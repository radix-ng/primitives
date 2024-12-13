import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnowIcon, X } from 'lucide-angular';
import { RdxPopoverAlign, RdxPopoverModule } from '../index';
import { RdxPopoverContentAttributesComponent } from '../src/popover-content-attributes.component';
import { RdxPopoverSide } from '../src/popover.types';

@Component({
    selector: 'rdx-popover-animations',
    standalone: true,
    imports: [
        FormsModule,
        RdxPopoverModule,
        LucideAngularModule,
        RdxPopoverContentAttributesComponent,
        NgClass
    ],
    styles: `
        .container {
            height: 150px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        /* reset */
        .reset {
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
        }

        .PopoverContent:focus {
            box-shadow:
                hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
                hsl(206 22% 7% / 20%) 0px 10px 20px -15px,
                0 0 0 2px var(--violet-7);
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

        /* =============== Params layout =============== */

        .ParamsContainer {
            display: flex;
            column-gap: 8px;
            color: var(--white-a12);
            margin-bottom: 32px;
        }

        /* =============== Custom Animation =============== */

        /* Open animations */

        .rdx-custom-animated-content {
            &:is(.rdx-custom-animated-content-open, .rdx-custom-animated-content-close) {
                animation-duration: 400ms;
                animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                will-change: transform, opacity;
            }

            &.rdx-custom-animated-content-open {
                &[data-state='open'][data-side='top'] {
                    animation-name: rdxCustomSlideDownAndFade;
                }

                &[data-state='open'][data-side='right'] {
                    animation-name: rdxCustomSlideLeftAndFade;
                }

                &[data-state='open'][data-side='bottom'] {
                    animation-name: rdxCustomSlideUpAndFade;
                }

                &[data-state='open'][data-side='left'] {
                    animation-name: rdxCustomSlideRightAndFade;
                }
            }

            &.rdx-custom-animated-content-close {
                &[data-state='closed'][data-side='top'] {
                    animation-name: rdxCustomSlideDownAndFadeReverse;
                }

                &[data-state='closed'][data-side='right'] {
                    animation-name: rdxCustomSlideLeftAndFadeReverse;
                }

                &[data-state='closed'][data-side='bottom'] {
                    animation-name: rdxCustomSlideUpAndFadeReverse;
                }

                &[data-state='closed'][data-side='left'] {
                    animation-name: rdxCustomSlideRightAndFadeReverse;
                }
            }
        }

        @keyframes rdxCustomSlideUpAndFade {
            from {
                opacity: 0;
                transform: translateY(2px);
                /*transition:left 1s linear;*/
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes rdxCustomSlideRightAndFade {
            from {
                opacity: 0;
                transform: translateX(-2px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes rdxCustomSlideDownAndFade {
            from {
                opacity: 0;
                transform: translateY(-2px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes rdxCustomSlideLeftAndFade {
            from {
                opacity: 0;
                transform: translateX(2px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        /* Close animations */

        @keyframes rdxCustomSlideUpAndFadeReverse {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(2px);
            }
        }

        @keyframes rdxCustomSlideRightAndFadeReverse {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-2px);
            }
        }

        @keyframes rdxCustomSlideDownAndFadeReverse {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-2px);
            }
        }

        @keyframes rdxCustomSlideLeftAndFadeReverse {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(2px);
            }
        }
    `,
    template: `
        <div class="ParamsContainer">
            CSS Animation:
            <select
                [ngModel]="cssAnimation()"
                (ngModelChange)="cssAnimation.set($event === 'true' ? true : $event === 'false' ? false : $event)"
            >
                <option [value]="true">{{ 'true' }}</option>
                <option [value]="false">{{ 'false' }}</option>
                <option [value]="'custom'">{{ '"custom"' }}</option>
            </select>
            On Show Animation:
            <input [ngModel]="cssOnShowAnimation()" (ngModelChange)="cssOnShowAnimation.set($event)" type="checkbox" />
            On Close Animation:
            <input
                [ngModel]="cssOnCloseAnimation()"
                (ngModelChange)="cssOnCloseAnimation.set($event)"
                type="checkbox"
            />
        </div>

        <div class="container">
            <ng-container
                [cssAnimation]="cssAnimation()"
                [cssOnShowAnimation]="cssOnShowAnimation()"
                [cssOnCloseAnimation]="cssOnCloseAnimation()"
                rdxPopoverRoot
            >
                <button class="IconButton reset" rdxPopoverTrigger>
                    <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                </button>

                <ng-template rdxPopoverContent>
                    <div
                        class="PopoverContent"
                        [ngClass]="{
                            'rdx-custom-animated-content': cssAnimation() === 'custom',
                            'rdx-custom-animated-content-open': cssAnimation() === 'custom' && cssOnShowAnimation(),
                            'rdx-custom-animated-content-close': cssAnimation() === 'custom' && cssOnCloseAnimation()
                        }"
                        rdxPopoverContentAttributes
                    >
                        <button class="PopoverClose reset" rdxPopoverClose aria-label="Close">
                            <lucide-angular [img]="XIcon" size="16" style="display: flex" />
                        </button>
                        <div style="display: flex; flex-direction: column; gap: 10px">
                            <p class="Text" style="margin-bottom: 10px">Dimensions</p>
                            <fieldset class="reset Fieldset">
                                <label class="Label" for="width">Width</label>
                                <input class="reset Input" id="width" value="100%" />
                            </fieldset>
                            <fieldset class="reset Fieldset">
                                <label class="Label" for="maxWidth">Max. width</label>
                                <input class="reset Input" id="maxWidth" value="300px" />
                            </fieldset>
                            <fieldset class="reset Fieldset">
                                <label class="Label" for="height">Height</label>
                                <input class="reset Input" id="height" value="25px" />
                            </fieldset>
                            <fieldset class="reset Fieldset">
                                <label class="Label" for="maxHeight">Max. height</label>
                                <input class="reset Input" id="maxHeight" value="none" />
                            </fieldset>
                        </div>
                        <div class="PopoverArrow" rdxPopoverArrow></div>
                    </div>
                </ng-template>
            </ng-container>
        </div>
    `
})
export class RdxPopoverAnimationsComponent {
    readonly MountainSnowIcon = MountainSnowIcon;
    readonly XIcon = X;

    cssAnimation = signal<boolean | 'custom'>(true);
    cssOnShowAnimation = signal(true);
    cssOnCloseAnimation = signal(true);

    readonly sides = RdxPopoverSide;
    readonly aligns = RdxPopoverAlign;
}
