import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnowIcon, X } from 'lucide-angular';
import { RdxPopoverAlign, RdxPopoverModule, RdxPopoverSide } from '../index';
import { RdxPopoverContentAttributesComponent } from '../src/popover-content-attributes.component';
import styles from './popover-styles.constants';
import { PopoverWithEventBaseComponent } from './popover-with-event-base.component';

@Component({
    selector: 'rdx-popover-positioning',
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
        <popover-with-event-base>
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
            </div>

            <div class="ParamsContainer">
                Alternate positions:
                <input
                    [ngModel]="disableAlternatePositions()"
                    (ngModelChange)="disableAlternatePositions.set($event)"
                    type="checkbox"
                />
            </div>

            <div class="container">
                <ng-container rdxPopoverRoot>
                    <button class="reset IconButton" rdxPopoverTrigger>
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
export class RdxPopoverPositioningComponent {
    readonly selectedSide = signal(RdxPopoverSide.Top);
    readonly selectedAlign = signal(RdxPopoverAlign.Center);
    readonly sideOffset = signal(8);
    readonly alignOffset = signal<number | undefined>(void 0);
    readonly disableAlternatePositions = signal(false);

    readonly sides = RdxPopoverSide;
    readonly aligns = RdxPopoverAlign;

    readonly MountainSnowIcon = MountainSnowIcon;
    readonly XIcon = X;
}
