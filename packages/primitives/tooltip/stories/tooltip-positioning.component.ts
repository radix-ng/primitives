import { Component, signal, viewChild } from '@angular/core';
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
    selector: 'rdx-tooltip-positioning',
    providers: [provideRdxCdkEventService()],
    imports: [
        FormsModule,
        RdxTooltipModule,
        LucideAngularModule,
        RdxTooltipContentAttributesComponent,
        WithOptionPanelComponent
    ],
    styles: styles(),
    template: `
        <tooltip-with-option-panel
            [arrowWidth]="arrowWidth()"
            [arrowHeight]="arrowHeight()"
            [openDelay]="openDelay()"
            [closeDelay]="closeDelay()"
            (onOverlayEscapeKeyDownDisabledChange)="onOverlayEscapeKeyDownDisabled.set($event)"
            (onOverlayOutsideClickDisabledChange)="onOverlayOutsideClickDisabled.set($event)"
            (arrowWidthChange)="arrowWidth.set($event)"
            (arrowHeightChange)="arrowHeight.set($event)"
            (openDelayChange)="openDelay.set($event)"
            (closeDelayChange)="closeDelay.set($event)"
        >
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
                <input
                    [ngModel]="disableAlternatePositions()"
                    (ngModelChange)="disableAlternatePositions.set($event)"
                    type="checkbox"
                />
                Disable alternate positions (to see the result, scroll the page to make the tooltip cross the viewport
                boundary)
            </div>

            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container">
                <ng-container [openDelay]="openDelay()" [closeDelay]="closeDelay()" rdxTooltipRoot>
                    <button class="reset IconButton" rdxTooltipTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [sideOffset]="sideOffset()"
                        [alignOffset]="alignOffset()"
                        [side]="selectedSide()"
                        [align]="selectedAlign()"
                        [alternatePositionsDisabled]="disableAlternatePositions()"
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        rdxTooltipContent
                    >
                        <div class="TooltipContent" rdxTooltipContentAttributes>
                            <button class="reset TooltipClose" rdxTooltipClose aria-label="Close">
                                <lucide-angular [img]="XIcon" size="12" style="display: flex" />
                            </button>
                            Add to library
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
export class RdxTooltipPositioningComponent extends OptionPanelBase {
    readonly rootDirective = viewChild(RdxTooltipRootDirective);

    readonly selectedSide = signal(RdxPositionSide.Top);
    readonly selectedAlign = signal(RdxPositionAlign.Center);
    readonly sideOffset = signal<number | undefined>(void 0);
    readonly alignOffset = signal<number | undefined>(void 0);
    readonly disableAlternatePositions = signal(false);

    readonly sides = RdxPositionSide;
    readonly aligns = RdxPositionAlign;

    readonly MountainSnowIcon = MountainSnow;
    readonly XIcon = X;
    protected readonly containerAlert = containerAlert;
    protected readonly TriangleAlert = TriangleAlert;
}
