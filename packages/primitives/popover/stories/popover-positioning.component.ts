import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnowIcon, X } from 'lucide-angular';
import { RdxPopoverModule } from '../index';
import { RdxPopoverAlign, RdxPopoverSide } from '../src/popover.types';

@Component({
    selector: 'rdx-popover-positioning',
    standalone: true,
    imports: [
        FormsModule,
        RdxPopoverModule,
        LucideAngularModule
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

        /* =============== Params layout =============== */

        .ParamsContainer {
            display: flex;
            column-gap: 8px;
            color: var(--white-a12);
            margin-bottom: 32px;
        }
    `,
    template: `
        <div class="ParamsContainer">
            Side:
            <select [ngModel]="selectedSide()" (ngModelChange)="selectedSide.set($event)">
                <option [value]="sides.Top">{{ sides.Top }}</option>
                <option [value]="sides.Bottom">{{ sides.Bottom }}</option>
                <option [value]="sides.Left">{{ sides.Left }}</option>
                <option [value]="sides.Right">{{ sides.Right }}</option>
            </select>
            Align:
            <select [ngModel]="selectedAlign()" (ngModelChange)="selectedAlign.set($event)">
                <option [value]="aligns.Center">{{ aligns.Center }}</option>
                <option [value]="aligns.Start">{{ aligns.Start }}</option>
                <option [value]="aligns.End">{{ aligns.End }}</option>
            </select>
            SideOffset:
            <input [ngModel]="sideOffset()" (ngModelChange)="sideOffset.set($event)" type="number" />
            AlignOffset:
            <input [ngModel]="alignOffset()" (ngModelChange)="alignOffset.set($event)" type="number" />
            Alternate positions:
            <input
                [ngModel]="disableAlternatePositions()"
                (ngModelChange)="disableAlternatePositions.set($event)"
                type="checkbox"
            />
        </div>

        <div class="container">
            <ng-container rdxPopoverRoot>
                <button class="IconButton reset" rdxPopoverTrigger>
                    <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                </button>

                <ng-template
                    [sideOffset]="sideOffset()"
                    [alignOffset]="alignOffset()"
                    [side]="selectedSide()"
                    [align]="selectedAlign()"
                    [disableAlternatePositions]="disableAlternatePositions()"
                    rdxPopoverContent
                >
                    <div class="PopoverContent">
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
export class RdxPopoverPositioningComponent {
    readonly MountainSnowIcon = MountainSnowIcon;
    readonly XIcon = X;

    selectedSide = signal(RdxPopoverSide.Top);
    selectedAlign = signal(RdxPopoverAlign.Center);
    sideOffset = signal(8);
    alignOffset = signal(8);
    disableAlternatePositions = signal(false);

    readonly sides = RdxPopoverSide;
    readonly aligns = RdxPopoverAlign;
}
