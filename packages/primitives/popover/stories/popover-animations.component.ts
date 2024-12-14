import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnowIcon, X } from 'lucide-angular';
import { RdxPopoverAlign, RdxPopoverModule } from '../index';
import { RdxPopoverContentAttributesComponent } from '../src/popover-content-attributes.component';
import { RdxPopoverSide } from '../src/popover.types';
import styles from './popover-styles.constants';
import { PopoverWithEventBaseComponent } from './popover-with-event-base.component';

@Component({
    selector: 'rdx-popover-animations',
    standalone: true,
    imports: [
        FormsModule,
        RdxPopoverModule,
        LucideAngularModule,
        RdxPopoverContentAttributesComponent,
        NgClass,
        PopoverWithEventBaseComponent
    ],
    styles: styles(true),
    template: `
        <popover-with-event-base>
            <div class="ParamsContainer">
                CSS Animation:
                <select
                    [ngModel]="cssAnimation()"
                    (ngModelChange)="cssAnimation.set($event === 'true' ? true : $event === 'false' ? false : $event)"
                >
                    <option [value]="true">{{ 'true' }}</option>
                    <option [value]="false">{{ 'false' }}</option>
                </select>
                On Show Animation:
                <input
                    [ngModel]="cssOnShowAnimation()"
                    (ngModelChange)="cssOnShowAnimation.set($event)"
                    type="checkbox"
                />
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
                                'rdx-custom-animated-content-close':
                                    cssAnimation() === 'custom' && cssOnCloseAnimation()
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
        </popover-with-event-base>
    `
})
export class RdxPopoverAnimationsComponent {
    readonly MountainSnowIcon = MountainSnowIcon;
    readonly XIcon = X;

    readonly sides = RdxPopoverSide;
    readonly aligns = RdxPopoverAlign;

    cssAnimation = signal<boolean>(true);
    cssOnShowAnimation = signal(true);
    cssOnCloseAnimation = signal(true);
}
