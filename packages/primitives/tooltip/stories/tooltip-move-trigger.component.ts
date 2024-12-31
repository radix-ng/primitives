import { afterNextRender, Component, ElementRef, inject, NgZone, Renderer2, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnow, TriangleAlert, X } from 'lucide-angular';
import { asyncScheduler, fromEvent } from 'rxjs';
import { RdxTooltipModule, RdxTooltipRootDirective } from '../index';
import { provideRdxCdkEventService } from '../src/utils/cdk-event.service';
import { containerAlert } from './utils/constants';
import { OptionPanelBase } from './utils/option-panel-base.class';
import { generateRandomSentence } from './utils/rendom-sentence.util';
import styles from './utils/styles.constants';
import { WithOptionPanelComponent } from './utils/with-option-panel.component';

@Component({
    selector: 'rdx-tooltip-move-trigger',
    providers: [provideRdxCdkEventService()],
    imports: [
        FormsModule,
        RdxTooltipModule,
        LucideAngularModule,
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
            <div class="container" #container style="position: relative; display: block;">
                <ng-container
                    #root2="rdxTooltipRoot"
                    [open]="isOpenTrue()"
                    [openDelay]="openDelay()"
                    [closeDelay]="closeDelay()"
                    [externalControl]="externalControlTrue()"
                    rdxTooltipRoot
                >
                    <button
                        class="reset IconButton"
                        rdxTooltipTrigger
                        style="cursor: move; position: absolute; left: 50%; top: 50%;"
                    >
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template
                        [sideOffset]="8"
                        [onOverlayEscapeKeyDownDisabled]="onOverlayEscapeKeyDownDisabled()"
                        [onOverlayOutsideClickDisabled]="onOverlayOutsideClickDisabled()"
                        (onOpen)="countOpenTrue(true)"
                        (onClosed)="countOpenTrue(false)"
                        rdxTooltipContent
                    >
                        <div class="TooltipContent" rdxTooltipContentAttributes>
                            <button class="reset TooltipClose" rdxTooltipClose aria-label="Close">
                                <lucide-angular [img]="XIcon" size="12" style="display: flex" />
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
export class RdxTooltipMoveTriggerComponent extends OptionPanelBase {
    tooltipHtml = signal(generateRandomSentence());

    readonly rootDirective = viewChild(RdxTooltipRootDirective);
    readonly container = viewChild<ElementRef<HTMLElement>>('container');

    readonly renderer2 = inject(Renderer2);
    readonly ngZone = inject(NgZone);
    readonly MountainSnowIcon = MountainSnow;

    readonly XIcon = X;
    isOpenTrue = signal(true);
    counterOpenTrue = signal(0);
    externalControlTrue = signal(true);

    constructor() {
        super();
        afterNextRender({
            read: () => {
                this.listenToPointerDownEvent();
                this.listenToPointerMoveEvent();
                this.listenToPointerUpEvent();
            }
        });
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

    private pointerdown = false;

    private listenToPointerDownEvent() {
        this.ngZone.runOutsideAngular(() => {
            fromEvent(
                this.rootDirective()!.triggerDirective().elementRef.nativeElement,
                'pointerdown',
                (event: PointerEvent) => {
                    if (event.pointerType === 'mouse' && event.button !== 0) {
                        return;
                    }
                    this.pointerdown = true;
                }
            )
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        });
    }

    private listenToPointerMoveEvent() {
        let moveCounter = 0;
        this.ngZone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView!, 'pointermove', (event: PointerEvent) => {
                if (!this.pointerdown) {
                    return;
                }
                moveCounter++;
                const borderWidth = 3;
                const triggerElement = this.rootDirective()!.triggerDirective().elementRef.nativeElement;
                const containerElement = this.container()!.nativeElement;
                const triggerClientRect = triggerElement.getBoundingClientRect();
                const containerClientRect = containerElement.getBoundingClientRect();
                const diffs = {
                    top: triggerClientRect.top - borderWidth - containerClientRect.top + event.movementY,
                    left: triggerClientRect.left - borderWidth - containerClientRect.left + event.movementX,
                    bottom: containerClientRect.bottom - (triggerClientRect.bottom + borderWidth) - event.movementY,
                    right: containerClientRect.right - (triggerClientRect.right + borderWidth) - event.movementX
                };
                let positionChanged = false;
                if (diffs.top > -1 && diffs.bottom > -1) {
                    this.renderer2.setStyle(triggerElement, 'top', `${diffs.top.toString()}px`);
                    positionChanged = true;
                }
                if (diffs.left > -1 && diffs.right > -1) {
                    this.renderer2.setStyle(triggerElement, 'left', `${diffs.left.toString()}px`);
                    positionChanged = true;
                }
                if (positionChanged) {
                    if (moveCounter % 20 === 0) {
                        this.tooltipHtml.set(generateRandomSentence());
                    }
                    asyncScheduler.schedule(() => this.rootDirective()?.contentDirective().updatePosition());
                }
            })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        });
    }

    private listenToPointerUpEvent() {
        this.ngZone.runOutsideAngular(() => {
            fromEvent(this.document.defaultView!, 'pointerup', (event: PointerEvent) => {
                if (event.pointerType === 'mouse' && event.button !== 0) {
                    return;
                }
                this.pointerdown = false;
            })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
        });
    }
}
