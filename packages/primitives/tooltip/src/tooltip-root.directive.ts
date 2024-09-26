import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { DomPortal } from '@angular/cdk/portal';
import {
    computed,
    contentChild,
    Directive,
    effect,
    inject,
    InjectionToken,
    input,
    OnInit,
    output,
    signal
} from '@angular/core';
import { RdxTooltipContentDirective } from './tooltip-content.directive';
import { RdxTooltipTriggerDirective } from './tooltip-trigger.directive';
import { injectTooltipConfig } from './tooltip.config';

export type RdxTooltipState = 'delayed-open' | 'instant-open' | 'closed';

export const RdxTooltipRootToken = new InjectionToken<RdxTooltipRootDirective>('RdxTooltipRootToken');

export function injectTooltipRoot(): RdxTooltipRootDirective {
    return inject(RdxTooltipRootToken);
}

@Directive({
    selector: '[rdxTooltipRoot]',
    standalone: true,
    providers: [
        {
            provide: RdxTooltipRootToken,
            useExisting: RdxTooltipRootDirective
        }
    ],
    exportAs: 'rdxTooltipRoot'
})
export class RdxTooltipRootDirective implements OnInit {
    readonly tooltipConfig = injectTooltipConfig();
    defaultOpen = input<boolean>(false);
    open = input<boolean>(this.defaultOpen());

    delayDuration = input<number>(this.tooltipConfig.delayDuration);
    disableHoverableContent = input<boolean>(this.tooltipConfig.disableHoverableContent ?? false);

    openTimer = 0;
    skipDelayTimer = 0;

    isOpen = signal<boolean>(this.open());
    isOpenDelayed = signal<boolean>(true);
    wasOpenDelayed = signal<boolean>(false);
    state = computed<RdxTooltipState>(() => {
        const currentIsOpen = this.isOpen();
        const currentWasOpenDelayed = this.wasOpenDelayed();

        if (currentIsOpen) {
            return currentWasOpenDelayed ? 'delayed-open' : 'instant-open';
        }

        return 'closed';
    });
    tooltipContentDirective = contentChild.required(RdxTooltipContentDirective);
    tooltipTriggerDirective = contentChild.required(RdxTooltipTriggerDirective);
    tooltipContent = computed(() => this.tooltipContentDirective()?.elementRef);
    onOpenChange = output<boolean>();
    overlayRef: OverlayRef | null = null;
    overlay = inject(Overlay);
    instance?: unknown;

    private portal: DomPortal<unknown>;

    ngOnInit(): void {
        if (this.defaultOpen()) {
            this.handleOpen();
        }
    }

    onTriggerEnter(): void {
        if (this.isOpenDelayed()) {
            this.handleDelayedOpen();
        } else {
            this.handleOpen();
        }
    }

    onTriggerLeave(): void {
        window.clearTimeout(this.openTimer);
        this.handleClose();
    }

    onOpen(): void {
        window.clearTimeout(this.skipDelayTimer);
        this.isOpenDelayed.set(false);
    }

    onClose(): void {
        window.clearTimeout(this.skipDelayTimer);

        this.skipDelayTimer = window.setTimeout(() => {
            this.isOpenDelayed.set(true);
        }, this.tooltipConfig.skipDelayDuration);
    }

    handleOpen(): void {
        this.wasOpenDelayed.set(false);
        this.setOpen(true);
    }

    handleClose(): void {
        window.clearTimeout(this.openTimer);
        this.setOpen(false);
    }

    private handleDelayedOpen(): void {
        window.clearTimeout(this.openTimer);

        this.openTimer = window.setTimeout(() => {
            this.wasOpenDelayed.set(true);
            this.setOpen(true);
        }, this.delayDuration());
    }

    private setOpen(open = false): void {
        if (open) {
            this.onOpen();

            document.dispatchEvent(new CustomEvent('tooltip.open'));
        } else {
            this.onClose();
        }

        this.isOpen.set(open);
        this.onOpenChange.emit(open);
    }

    private createOverlayRef(): OverlayRef | null {
        if (this.overlayRef) {
            return this.overlayRef;
        }

        const tooltipTriggerDirective = this.tooltipTriggerDirective();

        if (!tooltipTriggerDirective) {
            return null;
        }

        const strategy = this.overlay
            .position()
            .flexibleConnectedTo(tooltipTriggerDirective.elementRef)
            // .withTransformOriginOn(this.originSelector)
            .withFlexibleDimensions(false)
            .withPositions([
                {
                    originX: 'center',
                    originY: 'top',
                    overlayX: 'center',
                    overlayY: 'bottom'
                }
            ])
            .withLockedPosition();
        //.withScrollableC
        // ontainers(this.scrollDispatcher.getAncestorScrollContainers(this.elementRef));

        // strategy.positionChanges.pipe(takeUntil(this.destroyed)).subscribe(this.onPositionChange);

        this.overlayRef = this.overlay.create({
            //...this.overlayConfig,
            direction: undefined, // this.direction || undefined,
            positionStrategy: strategy
            // scrollStrategy: this.scrollStrategy()
        });

        // this.overlayRef.detachments().pipe(takeUntil(this.destroyed)).subscribe(this.detach);

        return this.overlayRef;
    }

    private show(): void {
        this.overlayRef = this.createOverlayRef();
        const contentElementRef = this.tooltipContentDirective()?.elementRef;

        if (this.overlayRef === null || contentElementRef === undefined) {
            console.log('some troubles', this.overlayRef, contentElementRef);
            return;
        }

        this.detach();

        this.portal = this.portal || new DomPortal(contentElementRef);

        console.log(123123);
        this.instance = this.overlayRef.attach(this.portal);
        console.log('instance', this.instance);
    }

    private detach(): void {
        if (this.overlayRef?.hasAttached()) {
            this.overlayRef.detach();
        }
    }

    private readonly onIsOpenChangeEffect = effect(() => {
        const isOpen = this.isOpen();
        const tooltipContent = this.tooltipContent();

        if (isOpen) {
            console.log('show', tooltipContent);
            this.show();
        } else {
            console.log('hide', tooltipContent);
        }
    });
}
