import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxPositionAlign, RdxPositionSide } from '@radix-ng/primitives/core';
import { LucideAngularModule, MountainSnow, TriangleAlert, X } from 'lucide-angular';
import { RdxTooltipModule, RdxTooltipRootDirective } from '../index';
import { RdxTooltipContentAttributesComponent } from '../src/tooltip-content-attributes.component';
import { provideRdxCdkEventService } from '../src/utils/cdk-event.service';
import { containerAlert } from './utils/constants';
import { OptionPanelBase } from './utils/option-panel-base.class';
import styles from './utils/styles.constants';
import { WithOptionPanelComponent } from './utils/with-option-panel.component';

@Component({
    selector: 'rdx-tooltip-events',
    providers: [provideRdxCdkEventService()],
    imports: [
        RdxTooltipModule,
        LucideAngularModule,
        FormsModule,
        RdxTooltipContentAttributesComponent,
        WithOptionPanelComponent
    ],
    styles: `
        ${styles()}
    `,
    template: `
        <tooltip-with-option-panel
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
                <ng-container rdxTooltipRoot>
                    <button class="reset IconButton" #triggerElement rdxTooltipTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        [sideOffset]="8"
                        rdxTooltipContent
                    >
                        <div class="TooltipContent" rdxTooltipContentAttributes>
                            <button class="reset TooltipClose" rdxTooltipClose aria-label="Close">
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
                            <div
                                class="TooltipArrow"
                                [width]="arrowWidth()"
                                [height]="arrowHeight()"
                                rdxTooltipArrow
                            ></div>
                        </div>
                    </ng-template>
                </ng-container>
            </div>
            <div class="TooltipId">ID: {{ rootDirective()?.uniqueId() }}</div>
        </tooltip-with-option-panel>
    `
})
export class RdxTooltipEventsComponent extends OptionPanelBase {
    readonly rootDirective = viewChild(RdxTooltipRootDirective);

    readonly MountainSnowIcon = MountainSnow;
    readonly XIcon = X;

    protected readonly sides = RdxPositionSide;
    protected readonly aligns = RdxPositionAlign;
    protected readonly containerAlert = containerAlert;
    protected readonly TriangleAlert = TriangleAlert;
}
