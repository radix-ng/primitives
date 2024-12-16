import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnowIcon, X } from 'lucide-angular';
import { RdxPopoverModule } from '../index';
import { RdxPopoverContentAttributesComponent } from '../src/popover-content-attributes.component';
import styles from './popover-styles.constants';
import { PopoverWithEventBaseComponent } from './popover-with-event-base.component';

@Component({
    selector: 'rdx-popover-triggering',
    standalone: true,
    imports: [
        FormsModule,
        RdxPopoverModule,
        LucideAngularModule,
        RdxPopoverContentAttributesComponent,
        PopoverWithEventBaseComponent
    ],
    styles: styles(),
    template: `
        <p class="ExampleSubtitle">Initially closed</p>
        <popover-with-event-base>
            <div class="ParamsContainer">
                <button (click)="triggerOpenFalse()" type="button">Open: {{ isOpenFalse() }}</button>
                onOpenChange count: {{ counterOpenFalse() }}
            </div>

            <div class="ParamsContainer">
                <input
                    [ngModel]="externalControlFalse()"
                    (ngModelChange)="externalControlFalse.set($event)"
                    type="checkbox"
                />
                External control
            </div>

            <div class="container">
                <ng-container [open]="isOpenFalse()" [externalControl]="externalControlFalse()" rdxPopoverRoot>
                    <button class="reset IconButton" rdxPopoverTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [sideOffset]="8"
                        (onOpen)="countOpenFalse()"
                        (onClosed)="countOpenFalse()"
                        rdxPopoverContent
                    >
                        <div class="PopoverContent" rdxPopoverContentAttributes>
                            <button class="reset PopoverClose" rdxPopoverClose aria-label="Close">
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
        </popover-with-event-base>

        <p class="ExampleSubtitle">Initially open</p>
        <popover-with-event-base>
            <div class="ParamsContainer">
                <button (click)="triggerOpenTrue()" type="button">Open: {{ isOpenTrue() }}</button>
                <span>onOpenChange count: {{ counterOpenTrue() }}</span>
            </div>

            <div class="ParamsContainer">
                <input
                    [ngModel]="externalControlTrue()"
                    (ngModelChange)="externalControlTrue.set($event)"
                    type="checkbox"
                />
                External control
            </div>

            <div class="container">
                <ng-container [open]="isOpenTrue()" [externalControl]="externalControlTrue()" rdxPopoverRoot>
                    <button class="reset IconButton" rdxPopoverTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [sideOffset]="8"
                        (onOpen)="countOpenTrue()"
                        (onClosed)="countOpenTrue()"
                        rdxPopoverContent
                    >
                        <div class="PopoverContent" rdxPopoverContentAttributes>
                            <button class="reset PopoverClose" rdxPopoverClose aria-label="Close">
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
        </popover-with-event-base>
    `
})
export class RdxPopoverTriggeringComponent {
    readonly MountainSnowIcon = MountainSnowIcon;
    readonly XIcon = X;

    isOpenFalse = signal(false);
    counterOpenFalse = signal(0);
    externalControlFalse = signal(true);

    isOpenTrue = signal(true);
    counterOpenTrue = signal(0);
    externalControlTrue = signal(true);

    triggerOpenFalse(): void {
        this.isOpenFalse.update((value) => !value);
    }

    countOpenFalse(): void {
        this.counterOpenFalse.update((value) => value + 1);
    }

    triggerOpenTrue(): void {
        this.isOpenTrue.update((value) => !value);
    }

    countOpenTrue(): void {
        this.counterOpenTrue.update((value) => value + 1);
    }
}
