import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnowIcon, X } from 'lucide-angular';
import { RdxPopoverModule } from '../index';
import { RdxPopoverContentAttributesComponent } from '../src/popover-content-attributes.component';

@Component({
    selector: 'rdx-popover-triggering',
    standalone: true,
    imports: [
        FormsModule,
        RdxPopoverModule,
        LucideAngularModule,
        RdxPopoverContentAttributesComponent
    ],
    styles: `
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

        /* =============== Trigger layout =============== */

        .TriggerContainer {
            display: flex;
            column-gap: 8px;
            color: var(--white-a12);
            margin-bottom: 32px;
            align-items: baseline;

            button {
                color: var(--violet-11);
                background-color: white;
                box-shadow: 0 2px 10px var(--black-a7);
                padding: 4px 8px;
                border-radius: 4px;
            }
        }
    `,
    template: `
        <div class="TriggerContainer">
            <button (click)="trigger()" type="button">Open: {{ isOpen() }}</button>
            <span>onOpenChange count: {{ counter() }}</span>
        </div>
        <div class="container">
            <ng-container [open]="isOpen()" (onOpenChange)="count()" rdxPopoverRoot>
                <button class="IconButton" rdxPopoverTrigger>
                    <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                </button>

                <ng-template [sideOffset]="8" rdxPopoverContent>
                    <div class="PopoverContent" rdxPopoverContentAttributes>
                        <button class="PopoverClose" rdxPopoverClose aria-label="Close">
                            <lucide-angular [img]="XIcon" size="16" style="display: flex" />
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
export class RdxPopoverTriggeringComponent {
    readonly MountainSnowIcon = MountainSnowIcon;
    readonly XIcon = X;

    isOpen = signal(false);

    counter = signal(0);

    trigger(): void {
        this.isOpen.update((value) => !value);
    }

    count(): void {
        this.counter.update((value) => value + 1);
    }
}
