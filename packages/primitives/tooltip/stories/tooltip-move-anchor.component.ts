import { afterNextRender, Component, ElementRef, inject, NgZone, Renderer2, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, MapPinPlus, MountainSnow, TriangleAlert, X } from 'lucide-angular';
import { asyncScheduler, fromEvent } from 'rxjs';
import { RdxTooltipModule, RdxTooltipRootDirective } from '../index';
import { RdxTooltipAnchorDirective } from '../src/tooltip-anchor.directive';
import { RdxTooltipContentAttributesComponent } from '../src/tooltip-content-attributes.component';
import { provideRdxCdkEventService } from '../src/utils/cdk-event.service';
import { areRectsOverlapping } from './utils/are-rects-overlaping.util';
import { containerAlert } from './utils/constants';
import { OptionPanelBase } from './utils/option-panel-base.class';
import { generateRandomSentence } from './utils/rendom-sentence.util';
import styles from './utils/styles.constants';
import { WithOptionPanelComponent } from './utils/with-option-panel.component';

@Component({
    selector: 'rdx-tooltip-move-anchor',
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
        <p class="ExampleSubtitle">Move Internal Anchor (within TooltipRoot)</p>
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
                <button (mouseup)="triggerOpen1()" type="button">Open: {{ isOpen1() }}</button>
                <span>onOpenChange count: {{ counterOpen1() }}</span>
            </div>

            <div class="ParamsContainer">
                <input [ngModel]="externalControl1()" (ngModelChange)="externalControl1.set($event)" type="checkbox" />
                External control
            </div>

            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container" #container1 style="position: relative; display: block;">
                <ng-container
                    #root1="rdxTooltipRoot"
                    [open]="isOpen1()"
                    [externalControl]="externalControl1()"
                    [openDelay]="openDelay()"
                    [closeDelay]="closeDelay()"
                    rdxTooltipRoot
                >
                    <button
                        class="reset IconButton InternalAnchor"
                        rdxTooltipAnchor
                        style="cursor: move; position: absolute; left: 50%; top: 50%;"
                    >
                        <lucide-angular [img]="LucideMapPinPlusInside" size="16" style="display: flex" />
                    </button>

                    <button class="reset IconButton" rdxTooltipTrigger style="position: absolute; left: 75%; top: 50%;">
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        (onOpen)="countOpen1(true)"
                        (onClosed)="countOpen1(false)"
                        rdxTooltipContent
                    >
                        <div class="TooltipContent" rdxTooltipContentAttributes>
                            <button class="reset TooltipClose" rdxTooltipClose aria-label="Close">
                                <lucide-angular [img]="XIcon" size="12" style="display: flex" />
                            </button>
                            {{ tooltipHtml1() }}
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

        <p class="ExampleSubtitle">Move External Anchor (outside TooltipRoot)</p>
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
                <button (mouseup)="triggerOpen2()" type="button">Open: {{ isOpen2() }}</button>
                <span>onOpenChange count: {{ counterOpen2() }}</span>
            </div>

            <div class="ParamsContainer">
                <input [ngModel]="externalControl2()" (ngModelChange)="externalControl2.set($event)" type="checkbox" />
                External control
            </div>

            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container" #container2 style="position: relative; display: block;">
                <button
                    class="reset IconButton ExternalAnchor"
                    #externalAnchor="rdxTooltipAnchor"
                    rdxTooltipAnchor
                    style="cursor: move; position: absolute; left: 50%; top: 50%;"
                >
                    <lucide-angular [img]="LucideMapPinPlus" size="16" style="display: flex" />
                </button>

                <ng-container
                    #root2="rdxTooltipRoot"
                    [open]="isOpen2()"
                    [externalControl]="externalControl2()"
                    [anchor]="externalAnchor"
                    [openDelay]="openDelay()"
                    [closeDelay]="closeDelay()"
                    rdxTooltipRoot
                >
                    <button class="reset IconButton" rdxTooltipTrigger style="position: absolute; left: 75%; top: 50%;">
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        (onOpen)="countOpen2(true)"
                        (onClosed)="countOpen2(false)"
                        rdxTooltipContent
                    >
                        <div class="TooltipContent" rdxTooltipContentAttributes>
                            <button class="reset TooltipClose" rdxTooltipClose aria-label="Close">
                                <lucide-angular [img]="XIcon" size="12" style="display: flex" />
                            </button>
                            {{ tooltipHtml2() }}
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
export class RdxTooltipMoveAnchorComponent extends OptionPanelBase {
    tooltipHtml1 = signal(generateRandomSentence());
    tooltipHtml2 = signal(generateRandomSentence());

    readonly rootDirective1 = viewChild<RdxTooltipRootDirective>('root1');
    readonly rootDirective2 = viewChild<RdxTooltipRootDirective>('root2');
    readonly container1 = viewChild<ElementRef<HTMLElement>>('container1');
    readonly container2 = viewChild<ElementRef<HTMLElement>>('container2');

    readonly renderer2 = inject(Renderer2);
    readonly ngZone = inject(NgZone);

    isOpen1 = signal(true);
    counterOpen1 = signal(0);
    externalControl1 = signal(true);

    isOpen2 = signal(true);
    counterOpen2 = signal(0);
    externalControl2 = signal(true);

    readonly MountainSnowIcon = MountainSnow;
    readonly XIcon = X;
    readonly LucideMapPinPlusInside = MapPinPlus;
    readonly LucideMapPinPlus = MapPin;
    readonly TriangleAlert = TriangleAlert;
    readonly containerAlert = containerAlert;

    private pointerdown1 = false;
    private pointerdown2 = false;

    constructor() {
        super();
        afterNextRender({
            read: () => {
                this.listenToPointerDownEvent1();
                this.listenToPointerMoveEvent1();
                this.listenToPointerUpEvent1();
                this.listenToPointerDownEvent2();
                this.listenToPointerMoveEvent2();
                this.listenToPointerUpEvent2();
            }
        });
    }

    triggerOpen1(): void {
        this.isOpen1.update((value) => !value);
    }

    countOpen1(open: boolean): void {
        this.isOpen1.set(open);
        this.counterOpen1.update((value) => value + 1);
    }

    triggerOpen2(): void {
        this.isOpen2.update((value) => !value);
    }

    countOpen2(open: boolean): void {
        this.isOpen2.set(open);
        this.counterOpen2.update((value) => value + 1);
    }

    private listenToPointerDownEvent1() {
        this.ngZone.runOutsideAngular(() => {
            fromEvent(
                this.rootDirective1()!.anchorDirective()!.elementRef.nativeElement,
                'pointerdown',
                (event: PointerEvent) => {
                    if (event.pointerType === 'mouse' && event.button !== 0) {
                        return;
                    }
                    this.pointerdown1 = true;
                }
            )
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        });
    }

    private listenToPointerMoveEvent1() {
        let moveCounter = 0;
        this.ngZone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView!, 'pointermove', (event: PointerEvent) => {
                if (!this.pointerdown1) {
                    return;
                }
                moveCounter++;
                const borderWidth = 3;
                const anchorElement = this.rootDirective1()!.anchorDirective()!.elementRef.nativeElement;
                const triggerElement = this.rootDirective1()!.triggerDirective().elementRef.nativeElement;
                const triggerClientRect = triggerElement.getBoundingClientRect();
                const triggerElementStyle = window.getComputedStyle(triggerElement);
                const containerElement = this.container1()!.nativeElement;
                const anchorClientRect = anchorElement.getBoundingClientRect();
                const containerClientRect = containerElement.getBoundingClientRect();
                const newPossibleAnchorRect = {
                    top: anchorClientRect.top - borderWidth - containerClientRect.top + event.movementY,
                    left: anchorClientRect.left - borderWidth - containerClientRect.left + event.movementX,
                    bottom: containerClientRect.bottom - (anchorClientRect.bottom + borderWidth) - event.movementY,
                    right: containerClientRect.right - (anchorClientRect.right + borderWidth) - event.movementX
                };
                if (
                    areRectsOverlapping(
                        {
                            top: newPossibleAnchorRect.top,
                            left: newPossibleAnchorRect.left,
                            bottom: newPossibleAnchorRect.top + anchorClientRect.height,
                            right: newPossibleAnchorRect.left + anchorClientRect.width
                        },
                        {
                            top: parseFloat(triggerElementStyle.top),
                            left: parseFloat(triggerElementStyle.left),
                            bottom: parseFloat(triggerElementStyle.top) + triggerClientRect.height,
                            right: parseFloat(triggerElementStyle.left) + triggerClientRect.width
                        }
                    )
                ) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return;
                }
                let positionChanged = false;
                if (newPossibleAnchorRect.top > -1 && newPossibleAnchorRect.bottom > -1) {
                    this.renderer2.setStyle(anchorElement, 'top', `${newPossibleAnchorRect.top.toString()}px`);
                    positionChanged = true;
                }
                if (newPossibleAnchorRect.left > -1 && newPossibleAnchorRect.right > -1) {
                    this.renderer2.setStyle(anchorElement, 'left', `${newPossibleAnchorRect.left.toString()}px`);
                    positionChanged = true;
                }
                if (positionChanged) {
                    if (moveCounter % 20 === 0) {
                        this.tooltipHtml1.set(generateRandomSentence());
                    }
                    asyncScheduler.schedule(() => this.rootDirective1()?.contentDirective().updatePosition());
                } else {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        });
    }

    private listenToPointerUpEvent1() {
        this.ngZone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView!, 'pointerup', (event: PointerEvent) => {
                if (event.pointerType === 'mouse' && event.button !== 0) {
                    return;
                }
                this.pointerdown1 = false;
            })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        });
    }

    private listenToPointerDownEvent2() {
        this.ngZone.runOutsideAngular(() => {
            fromEvent(
                this.rootDirective2()!.anchorDirective()!.elementRef.nativeElement,
                'pointerdown',
                (event: PointerEvent) => {
                    if (event.pointerType === 'mouse' && event.button !== 0) {
                        return;
                    }
                    this.pointerdown2 = true;
                }
            )
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        });
    }

    private listenToPointerMoveEvent2() {
        let moveCounter = 0;
        this.ngZone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView!, 'pointermove', (event: PointerEvent) => {
                if (!this.pointerdown2) {
                    return;
                }
                moveCounter++;
                const borderWidth = 3;
                const anchorElement = this.rootDirective2()!.anchorDirective()!.elementRef.nativeElement;
                const triggerElement = this.rootDirective2()!.triggerDirective().elementRef.nativeElement;
                const triggerClientRect = triggerElement.getBoundingClientRect();
                const triggerElementStyle = window.getComputedStyle(triggerElement);
                const containerElement = this.container2()!.nativeElement;
                const anchorClientRect = anchorElement.getBoundingClientRect();
                const containerClientRect = containerElement.getBoundingClientRect();
                const newPossibleAnchorRect = {
                    top: anchorClientRect.top - borderWidth - containerClientRect.top + event.movementY,
                    left: anchorClientRect.left - borderWidth - containerClientRect.left + event.movementX,
                    bottom: containerClientRect.bottom - (anchorClientRect.bottom + borderWidth) - event.movementY,
                    right: containerClientRect.right - (anchorClientRect.right + borderWidth) - event.movementX
                };
                if (
                    areRectsOverlapping(
                        {
                            top: newPossibleAnchorRect.top,
                            left: newPossibleAnchorRect.left,
                            bottom: newPossibleAnchorRect.top + anchorClientRect.height,
                            right: newPossibleAnchorRect.left + anchorClientRect.width
                        },
                        {
                            top: parseFloat(triggerElementStyle.top),
                            left: parseFloat(triggerElementStyle.left),
                            bottom: parseFloat(triggerElementStyle.top) + triggerClientRect.height,
                            right: parseFloat(triggerElementStyle.left) + triggerClientRect.width
                        }
                    )
                ) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return;
                }
                let positionChanged = false;
                if (newPossibleAnchorRect.top > -1 && newPossibleAnchorRect.bottom > -1) {
                    this.renderer2.setStyle(anchorElement, 'top', `${newPossibleAnchorRect.top.toString()}px`);
                    positionChanged = true;
                }
                if (newPossibleAnchorRect.left > -1 && newPossibleAnchorRect.right > -1) {
                    this.renderer2.setStyle(anchorElement, 'left', `${newPossibleAnchorRect.left.toString()}px`);
                    positionChanged = true;
                }
                if (positionChanged) {
                    if (moveCounter % 20 === 0) {
                        this.tooltipHtml2.set(generateRandomSentence());
                    }
                    asyncScheduler.schedule(() => this.rootDirective2()?.contentDirective().updatePosition());
                } else {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        });
    }

    private listenToPointerUpEvent2() {
        this.ngZone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView!, 'pointerup', (event: PointerEvent) => {
                if (event.pointerType === 'mouse' && event.button !== 0) {
                    return;
                }
                this.pointerdown2 = false;
            })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        });
    }
}
