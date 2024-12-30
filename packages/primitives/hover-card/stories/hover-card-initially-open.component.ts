import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnow, TriangleAlert, X } from 'lucide-angular';
import { RdxHoverCardModule, RdxHoverCardRootDirective } from '../index';
import { RdxHoverCardContentAttributesComponent } from '../src/hover-card-content-attributes.component';
import { provideRdxCdkEventService } from '../src/utils/cdk-event.service';
import { containerAlert } from './utils/constants';
import { OptionPanelBase } from './utils/option-panel-base.class';
import styles from './utils/styles.constants';
import { WithOptionPanelComponent } from './utils/with-option-panel.component';

@Component({
    selector: 'rdx-hover-card-initially-open',
    providers: [provideRdxCdkEventService()],
    imports: [
        FormsModule,
        RdxHoverCardModule,
        LucideAngularModule,
        RdxHoverCardContentAttributesComponent,
        WithOptionPanelComponent
    ],
    styles: styles(),
    template: `
        <with-option-panel
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
                    [defaultOpen]="true"
                    [openDelay]="openDelay()"
                    [closeDelay]="closeDelay()"
                    rdxHoverCardRoot
                >
                    <button class="reset IconButton" rdxHoverCardTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        [sideOffset]="8"
                        rdxHoverCardContent
                    >
                        <div class="HoverCardContent" rdxHoverCardContentAttributes>
                            <button class="reset HoverCardClose" rdxHoverCardClose aria-label="Close">
                                <lucide-angular [img]="XIcon" size="12" style="display: flex" />
                            </button>
                            Add to library
                            <div
                                class="HoverCardArrow"
                                [width]="arrowWidth()"
                                [height]="arrowHeight()"
                                rdxHoverCardArrow
                            ></div>
                        </div>
                    </ng-template>
                </ng-container>
            </div>
            <div class="HoverCardId">ID: {{ rootDirective()?.uniqueId() }}</div>
        </with-option-panel>
    `
})
export class RdxHoverCardInitiallyOpenComponent extends OptionPanelBase {
    readonly rootDirective = viewChild(RdxHoverCardRootDirective);

    readonly MountainSnowIcon = MountainSnow;
    readonly XIcon = X;
    protected readonly containerAlert = containerAlert;
    protected readonly TriangleAlert = TriangleAlert;
}
