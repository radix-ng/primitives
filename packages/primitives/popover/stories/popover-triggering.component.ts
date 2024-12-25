import { Component, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnow, TriangleAlert, X } from 'lucide-angular';
import { RdxPopoverModule } from '../index';
import { RdxPopoverContentAttributesComponent } from '../src/popover-content-attributes.component';
import { provideRdxCdkEventService } from '../src/utils/cdk-event.service';
import { containerAlert } from './utils/constants';
import { IgnoreClickOutsideContainerBase } from './utils/ignore-click-outside-container-base.class';
import styles from './utils/styles.constants';
import { WithEventBaseComponent } from './utils/with-event-base.component';

@Component({
    selector: 'rdx-popover-triggering',
    providers: [provideRdxCdkEventService()],
    imports: [
        FormsModule,
        RdxPopoverModule,
        LucideAngularModule,
        RdxPopoverContentAttributesComponent,
        WithEventBaseComponent
    ],
    styles: styles(),
    template: `
        <p class="ExampleSubtitle">Initially closed</p>
        <popover-with-event-base
            (onOverlayEscapeKeyDownDisabledChange)="onOverlayEscapeKeyDownDisabled.set($event)"
            (onOverlayOutsideClickDisabledChange)="onOverlayOutsideClickDisabled.set($event)"
        >
            <div class="ParamsContainer">
                <button (mouseup)="triggerOpenFalse()" type="button">Open: {{ isOpenFalse() }}</button>
                onOpenChange count: {{ counterOpenFalse() }}
            </div>

            <div class="ParamsContainer">
                <input
                    [ngModel]="externalControlFalse()"
                    (ngModelChange)="externalControlFalse.set($event)"
                    type="checkbox"
                />
                External control
            </div>

            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container">
                <ng-container
                    #root1="rdxPopoverRoot"
                    [open]="isOpenFalse()"
                    [externalControl]="externalControlFalse()"
                    rdxPopoverRoot
                >
                    <button class="reset IconButton" rdxPopoverTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [sideOffset]="8"
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        (onOpen)="countOpenFalse(true)"
                        (onClosed)="countOpenFalse(false)"
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

        <p class="ExampleSubtitle">Initially open</p>
        <popover-with-event-base
            (onOverlayEscapeKeyDownDisabledChange)="onOverlayEscapeKeyDownDisabled.set($event)"
            (onOverlayOutsideClickDisabledChange)="onOverlayOutsideClickDisabled.set($event)"
        >
            <div class="ParamsContainer">
                <button (mouseup)="triggerOpenTrue()" type="button">Open: {{ isOpenTrue() }}</button>
                <span>onOpenChange count: {{ counterOpenTrue() }}</span>
            </div>

            <div class="ParamsContainer">
                <input
                    [ngModel]="externalControlTrue()"
                    (ngModelChange)="externalControlTrue.set($event)"
                    type="checkbox"
                />
                External control
            </div>

            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container">
                <ng-container
                    #root2="rdxPopoverRoot"
                    [open]="isOpenTrue()"
                    [externalControl]="externalControlTrue()"
                    rdxPopoverRoot
                >
                    <button class="reset IconButton" rdxPopoverTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [sideOffset]="8"
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        (onOpen)="countOpenTrue(true)"
                        (onClosed)="countOpenTrue(false)"
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
export class RdxPopoverTriggeringComponent extends IgnoreClickOutsideContainerBase {
    readonly popoverRootDirective1 = viewChild('root1');
    readonly popoverRootDirective2 = viewChild('root2');

    readonly MountainSnowIcon = MountainSnow;
    readonly XIcon = X;

    isOpenFalse = signal(false);
    counterOpenFalse = signal(0);
    externalControlFalse = signal(true);

    isOpenTrue = signal(true);
    counterOpenTrue = signal(0);
    externalControlTrue = signal(true);

    triggerOpenFalse(): void {
        this.isOpenFalse.update((value) => !value);
    }

    countOpenFalse(open: boolean): void {
        this.isOpenFalse.set(open);
        this.counterOpenFalse.update((value) => value + 1);
    }

    triggerOpenTrue(): void {
        this.isOpenTrue.update((value) => !value);
    }

    countOpenTrue(open: boolean): void {
        this.isOpenTrue.set(open);
        this.counterOpenTrue.update((value) => value + 1);
    }

    protected readonly containerAlert = containerAlert;
    protected readonly TriangleAlert = TriangleAlert;
}
