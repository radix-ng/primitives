import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, MapPinPlus, MountainSnow, TriangleAlert, X } from 'lucide-angular';
import { RdxTooltipModule } from '../index';
import { RdxTooltipAnchorDirective } from '../src/tooltip-anchor.directive';
import { RdxTooltipContentAttributesComponent } from '../src/tooltip-content-attributes.component';
import { provideRdxCdkEventService } from '../src/utils/cdk-event.service';
import { containerAlert } from './utils/constants';
import { OptionPanelBase } from './utils/option-panel-base.class';
import styles from './utils/styles.constants';
import { WithOptionPanelComponent } from './utils/with-option-panel.component';

@Component({
    selector: 'rdx-tooltip-anchor',
    providers: [provideRdxCdkEventService()],
    imports: [
        FormsModule,
        RdxTooltipModule,
        LucideAngularModule,
        RdxTooltipContentAttributesComponent,
        WithOptionPanelComponent,
        RdxTooltipAnchorDirective
    ],
    styles: styles(),
    template: `
        <p class="ExampleSubtitle">Internal Anchor (within TooltipRoot)</p>
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
            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container">
                <ng-container
                    #root1="rdxTooltipRoot"
                    [openDelay]="openDelay()"
                    [closeDelay]="closeDelay()"
                    rdxTooltipRoot
                >
                    <button class="reset IconButton InternalAnchor" rdxTooltipAnchor>
                        <lucide-angular [img]="LucideMapPinPlusInside" size="16" style="display: flex" />
                    </button>

                    <button class="reset IconButton" rdxTooltipTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
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
            <div class="TooltipId">ID: {{ rootDirective1()?.uniqueId() }}</div>
        </tooltip-with-option-panel>

        <p class="ExampleSubtitle">External Anchor (outside TooltipRoot)</p>
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
            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container">
                <button class="reset IconButton ExternalAnchor" #externalAnchor="rdxTooltipAnchor" rdxTooltipAnchor>
                    <lucide-angular [img]="LucideMapPinPlus" size="16" style="display: flex" />
                </button>

                <ng-container
                    #root2="rdxTooltipRoot"
                    [anchor]="externalAnchor"
                    [openDelay]="openDelay()"
                    [closeDelay]="closeDelay()"
                    rdxTooltipRoot
                >
                    <button class="reset IconButton" rdxTooltipTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
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
            <div class="TooltipId">ID: {{ rootDirective2()?.uniqueId() }}</div>
        </tooltip-with-option-panel>
    `
})
export class RdxTooltipAnchorComponent extends OptionPanelBase {
    readonly rootDirective1 = viewChild('root1');
    readonly rootDirective2 = viewChild('root2');

    readonly MountainSnowIcon = MountainSnow;
    readonly XIcon = X;
    readonly LucideMapPinPlusInside = MapPinPlus;
    readonly LucideMapPinPlus = MapPin;
    readonly TriangleAlert = TriangleAlert;
    readonly containerAlert = containerAlert;
}
