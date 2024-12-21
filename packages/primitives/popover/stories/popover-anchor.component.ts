import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    LucideAngularModule,
    LucideMapPinPlus,
    LucideMapPinPlusInside,
    MountainSnowIcon,
    TriangleAlert,
    X
} from 'lucide-angular';
import { RdxPopoverModule } from '../index';
import { RdxPopoverAnchorDirective } from '../src/popover-anchor.directive';
import { RdxPopoverContentAttributesComponent } from '../src/popover-content-attributes.component';
import { provideRdxCdkEventService } from '../src/utils/cdk-event.service';
import { containerAlert } from './utils/constants';
import { IgnoreClickOutsideContainerBase } from './utils/ignore-click-outside-container-base.class';
import styles from './utils/styles.constants';
import { WithEventBaseComponent } from './utils/with-event-base.component';

@Component({
    selector: 'rdx-popover-anchor',
    standalone: true,
    providers: [provideRdxCdkEventService()],
    imports: [
        FormsModule,
        RdxPopoverModule,
        LucideAngularModule,
        RdxPopoverContentAttributesComponent,
        WithEventBaseComponent,
        RdxPopoverAnchorDirective
    ],
    styles: styles(),
    template: `
        <p class="ExampleSubtitle">Internal Anchor (within PopoverRoot)</p>
        <popover-with-event-base
            (onOverlayEscapeKeyDownDisabledChange)="onOverlayEscapeKeyDownDisabled.set($event)"
            (onOverlayOutsideClickDisabledChange)="onOverlayOutsideClickDisabled.set($event)"
        >
            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container">
                <ng-container #root1="rdxPopoverRoot" rdxPopoverRoot>
                    <button class="reset IconButton InternalAnchor" rdxPopoverAnchor>
                        <lucide-angular [img]="LucideMapPinPlusInside" size="16" style="display: flex" />
                    </button>

                    <button class="reset IconButton" rdxPopoverTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
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
            <div class="PopoverId">ID: {{ popoverRootDirective1()?.uniqueId() }}</div>
        </popover-with-event-base>

        <p class="ExampleSubtitle">External Anchor (outside PopoverRoot)</p>
        <popover-with-event-base
            (onOverlayEscapeKeyDownDisabledChange)="onOverlayEscapeKeyDownDisabled.set($event)"
            (onOverlayOutsideClickDisabledChange)="onOverlayOutsideClickDisabled.set($event)"
        >
            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container">
                <button class="reset IconButton ExternalAnchor" #externalAnchor="rdxPopoverAnchor" rdxPopoverAnchor>
                    <lucide-angular [img]="LucideMapPinPlus" size="16" style="display: flex" />
                </button>

                <ng-container #root2="rdxPopoverRoot" [anchor]="externalAnchor" rdxPopoverRoot>
                    <button class="reset IconButton" rdxPopoverTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
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
            <div class="PopoverId">ID: {{ popoverRootDirective2()?.uniqueId() }}</div>
        </popover-with-event-base>
    `
})
export class RdxPopoverAnchorComponent extends IgnoreClickOutsideContainerBase {
    readonly popoverRootDirective1 = viewChild('root1');
    readonly popoverRootDirective2 = viewChild('root2');

    readonly MountainSnowIcon = MountainSnowIcon;
    readonly XIcon = X;
    readonly LucideMapPinPlusInside = LucideMapPinPlusInside;
    readonly LucideMapPinPlus = LucideMapPinPlus;
    readonly TriangleAlert = TriangleAlert;
    readonly containerAlert = containerAlert;
}
