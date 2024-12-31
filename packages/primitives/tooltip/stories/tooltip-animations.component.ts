import { Component, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxPositionAlign, RdxPositionSide } from '@radix-ng/primitives/core';
import { LucideAngularModule, MountainSnow, TriangleAlert, X } from 'lucide-angular';
import { RdxTooltipModule, RdxTooltipRootDirective } from '../index';
import { RdxTooltipContentAttributesComponent } from '../src/tooltip-content-attributes.component';
import { provideRdxCdkEventService } from '../src/utils/cdk-event.service';
import { containerAlert } from './utils/constants';
import { OptionPanelBase } from './utils/option-panel-base.class';
import { generateRandomSentence } from './utils/rendom-sentence.util';
import styles from './utils/styles.constants';
import { WithOptionPanelComponent } from './utils/with-option-panel.component';

@Component({
    selector: 'rdx-tooltip-animations',
    providers: [provideRdxCdkEventService()],
    imports: [
        FormsModule,
        RdxTooltipModule,
        LucideAngularModule,
        RdxTooltipContentAttributesComponent,
        WithOptionPanelComponent
    ],
    styles: styles(true),
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
                <input [ngModel]="cssAnimation()" (ngModelChange)="cssAnimation.set($event)" type="checkbox" />
                CSS Animation
                <input
                    [ngModel]="cssOpeningAnimation()"
                    (ngModelChange)="cssOpeningAnimation.set($event)"
                    type="checkbox"
                />
                On Opening Animation
                <input
                    [ngModel]="cssClosingAnimation()"
                    (ngModelChange)="cssClosingAnimation.set($event)"
                    type="checkbox"
                />
                On Closing Animation
            </div>

            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container">
                <ng-container
                    [cssAnimation]="cssAnimation()"
                    [cssOpeningAnimation]="cssOpeningAnimation()"
                    [cssClosingAnimation]="cssClosingAnimation()"
                    [openDelay]="openDelay()"
                    [closeDelay]="closeDelay()"
                    rdxTooltipRoot
                >
                    <button class="IconButton reset" rdxTooltipTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        rdxTooltipContent
                    >
                        <div class="TooltipContent" rdxTooltipContentAttributes>
                            <button class="TooltipClose reset" rdxTooltipClose aria-label="Close">
                                <lucide-angular [img]="XIcon" size="16" style="display: flex" />
                            </button>
                            {{ tooltipHtml() }}
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
export class RdxTooltipAnimationsComponent extends OptionPanelBase {
    tooltipHtml = signal(generateRandomSentence());

    readonly rootDirective = viewChild(RdxTooltipRootDirective);

    readonly MountainSnowIcon = MountainSnow;
    readonly XIcon = X;

    readonly sides = RdxPositionSide;
    readonly aligns = RdxPositionAlign;

    cssAnimation = signal<boolean>(true);
    cssOpeningAnimation = signal(true);
    cssClosingAnimation = signal(true);
    protected readonly TriangleAlert = TriangleAlert;
    protected readonly containerAlert = containerAlert;
}
