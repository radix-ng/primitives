import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, MapPinPlus, MountainSnow, TriangleAlert, X } from 'lucide-angular';
import { RdxHoverCardModule } from '../index';
import { RdxHoverCardAnchorDirective } from '../src/hover-card-anchor.directive';
import { RdxHoverCardContentAttributesComponent } from '../src/hover-card-content-attributes.component';
import { provideRdxCdkEventService } from '../src/utils/cdk-event.service';
import { containerAlert } from './utils/constants';
import { OptionPanelBase } from './utils/option-panel-base.class';
import styles from './utils/styles.constants';
import { WithOptionPanelComponent } from './utils/with-option-panel.component';

@Component({
    selector: 'rdx-hover-card-anchor',
    providers: [provideRdxCdkEventService()],
    imports: [
        FormsModule,
        RdxHoverCardModule,
        LucideAngularModule,
        RdxHoverCardContentAttributesComponent,
        WithOptionPanelComponent,
        RdxHoverCardAnchorDirective
    ],
    styles: styles(),
    template: `
        <p class="ExampleSubtitle">Internal Anchor (within HoverCardRoot)</p>
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
                    #root1="rdxHoverCardRoot"
                    [openDelay]="openDelay()"
                    [closeDelay]="closeDelay()"
                    rdxHoverCardRoot
                >
                    <button class="reset IconButton InternalAnchor" rdxHoverCardAnchor>
                        <lucide-angular [img]="LucideMapPinPlusInside" size="16" style="display: flex" />
                    </button>

                    <a
                        class="reset ImageTrigger"
                        href="https://twitter.com/radix_ui"
                        target="_blank"
                        rel="noreferrer noopener"
                        rdxHoverCardTrigger
                    >
                        <img
                            class="Image normal"
                            src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                            alt="Radix UI"
                        />
                    </a>

                    <ng-template
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        rdxHoverCardContent
                    >
                        <div class="HoverCardContent" rdxHoverCardContentAttributes>
                            <button class="reset HoverCardClose" rdxHoverCardClose aria-label="Close">
                                <lucide-angular [img]="XIcon" size="16" style="display: flex" />
                            </button>
                            <div style="display: flex; flex-direction: column; gap: 7px">
                                <img
                                    class="Image large"
                                    src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                                    alt="Radix UI"
                                />
                                <div style="display: flex; flex-direction: column; gap: 15px;">
                                    <div>
                                        <div class="Text bold">Radix</div>
                                        <div class="Text faded">{{ '@radix_ui' }}</div>
                                    </div>
                                    <div class="Text">
                                        Components, icons, colors, and templates for building high-quality, accessible
                                        UI. Free and open-source.
                                    </div>
                                    <div style="display: flex; gap: 15px">
                                        <div style="display: flex; gap: 5px">
                                            <div class="Text bold">0</div>
                                            &nbsp;
                                            <div class="Text faded">Following</div>
                                        </div>
                                        <div style="display: flex; gap: 5px">
                                            <div class="Text bold">2,900</div>
                                            &nbsp;
                                            <div class="Text faded">Followers</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
            <div class="HoverCardId">ID: {{ rootDirective1()?.uniqueId() }}</div>
        </with-option-panel>

        <p class="ExampleSubtitle">External Anchor (outside HoverCardRoot)</p>
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
                <button class="reset IconButton ExternalAnchor" #externalAnchor="rdxHoverCardAnchor" rdxHoverCardAnchor>
                    <lucide-angular [img]="LucideMapPinPlus" size="16" style="display: flex" />
                </button>

                <ng-container
                    #root2="rdxHoverCardRoot"
                    [anchor]="externalAnchor"
                    [openDelay]="openDelay()"
                    [closeDelay]="closeDelay()"
                    rdxHoverCardRoot
                >
                    <a
                        class="reset ImageTrigger"
                        href="https://twitter.com/radix_ui"
                        target="_blank"
                        rel="noreferrer noopener"
                        rdxHoverCardTrigger
                    >
                        <img
                            class="Image normal"
                            src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                            alt="Radix UI"
                        />
                    </a>

                    <ng-template
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        rdxHoverCardContent
                    >
                        <div class="HoverCardContent" rdxHoverCardContentAttributes>
                            <button class="reset HoverCardClose" rdxHoverCardClose aria-label="Close">
                                <lucide-angular [img]="XIcon" size="16" style="display: flex" />
                            </button>
                            <div style="display: flex; flex-direction: column; gap: 7px">
                                <img
                                    class="Image large"
                                    src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                                    alt="Radix UI"
                                />
                                <div style="display: flex; flex-direction: column; gap: 15px;">
                                    <div>
                                        <div class="Text bold">Radix</div>
                                        <div class="Text faded">{{ '@radix_ui' }}</div>
                                    </div>
                                    <div class="Text">
                                        Components, icons, colors, and templates for building high-quality, accessible
                                        UI. Free and open-source.
                                    </div>
                                    <div style="display: flex; gap: 15px">
                                        <div style="display: flex; gap: 5px">
                                            <div class="Text bold">0</div>
                                            &nbsp;
                                            <div class="Text faded">Following</div>
                                        </div>
                                        <div style="display: flex; gap: 5px">
                                            <div class="Text bold">2,900</div>
                                            &nbsp;
                                            <div class="Text faded">Followers</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
            <div class="HoverCardId">ID: {{ rootDirective2()?.uniqueId() }}</div>
        </with-option-panel>
    `
})
export class RdxHoverCardAnchorComponent extends OptionPanelBase {
    readonly rootDirective1 = viewChild('root1');
    readonly rootDirective2 = viewChild('root2');

    readonly MountainSnowIcon = MountainSnow;
    readonly XIcon = X;
    readonly LucideMapPinPlusInside = MapPinPlus;
    readonly LucideMapPinPlus = MapPin;
    readonly TriangleAlert = TriangleAlert;
    readonly containerAlert = containerAlert;
}
