import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnow, TriangleAlert, X } from 'lucide-angular';
import { RdxPopoverModule, RdxPopoverRootDirective } from '../index';
import { RdxPopoverContentAttributesComponent } from '../src/popover-content-attributes.component';
import { provideRdxCdkEventService } from '../src/utils/cdk-event.service';
import { containerAlert } from './utils/constants';
import { OptionPanelBase } from './utils/option-panel-base.class';
import styles from './utils/styles.constants';
import { WithOptionPanelComponent } from './utils/with-option-panel.component';

@Component({
    selector: 'rdx-popover-default',
    providers: [provideRdxCdkEventService()],
    imports: [
        FormsModule,
        RdxPopoverModule,
        LucideAngularModule,
        RdxPopoverContentAttributesComponent,
        WithOptionPanelComponent
    ],
    styles: styles(),
    template: `
        <popover-with-option-panel
            [arrowWidth]="arrowWidth()"
            [arrowHeight]="arrowHeight()"
            (onOverlayEscapeKeyDownDisabledChange)="onOverlayEscapeKeyDownDisabled.set($event)"
            (onOverlayOutsideClickDisabledChange)="onOverlayOutsideClickDisabled.set($event)"
            (arrowWidthChange)="arrowWidth.set($event)"
            (arrowHeightChange)="arrowHeight.set($event)"
        >
            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container">
                <ng-container rdxPopoverRoot>
                    <button class="reset IconButton" rdxPopoverTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        rdxPopoverContent
                    >
                        <div class="PopoverContent" rdxPopoverContentAttributes>
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
                            <button class="reset PopoverClose" rdxPopoverClose aria-label="Close">
                                <lucide-angular [img]="XIcon" size="16" style="display: flex" />
                            </button>
                            <div
                                class="PopoverArrow"
                                [width]="arrowWidth()"
                                [height]="arrowHeight()"
                                rdxPopoverArrow
                            ></div>
                        </div>
                    </ng-template>
                </ng-container>
            </div>
            <div class="PopoverId">ID: {{ popoverRootDirective()?.uniqueId() }}</div>
        </popover-with-option-panel>
    `
})
export class RdxPopoverDefaultComponent extends OptionPanelBase {
    readonly popoverRootDirective = viewChild(RdxPopoverRootDirective);

    readonly MountainSnowIcon = MountainSnow;
    readonly XIcon = X;
    protected readonly TriangleAlert = TriangleAlert;
    protected readonly containerAlert = containerAlert;
}
