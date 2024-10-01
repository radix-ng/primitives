import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    computed,
    contentChild,
    Directive,
    effect,
    forwardRef,
    inject,
    InjectionToken,
    input,
    OnInit,
    output,
    signal,
    ViewContainerRef,
    ViewRef
} from '@angular/core';
import { RdxTooltipContentToken } from './tooltip-content.token';
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
            useExisting: forwardRef(() => RdxTooltipRootDirective)
        }
    ],
    exportAs: 'rdxTooltipRoot'
})
export class RdxTooltipRootDirective implements OnInit {
    private readonly viewContainerRef = inject(ViewContainerRef);
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
    tooltipContentDirective = contentChild.required(RdxTooltipContentToken);
    tooltipTriggerDirective = contentChild.required(RdxTooltipTriggerDirective);
    tooltipContentTemplateRef = computed(() => this.tooltipContentDirective()?.templateRef);

    onOpenChange = output<boolean>();
    overlayRef?: OverlayRef;
    overlay = inject(Overlay);
    instance?: ViewRef;

    private portal: TemplatePortal<unknown>;

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

    private createOverlayRef(): OverlayRef {
        if (this.overlayRef) {
            return this.overlayRef;
        }

        const strategy = this.overlay
            .position()
            .flexibleConnectedTo(this.tooltipTriggerDirective().elementRef)
            // .withTransformOriginOn(this.originSelector)
            .withFlexibleDimensions(false)
            .withPositions([
                this.tooltipContentDirective().position()
            ])
            .withLockedPosition();
        //.withScrollableContainers(this.scrollDispatcher.getAncestorScrollContainers(this.elementRef));

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
        const tooltipContentTemplateRef = this.tooltipContentTemplateRef;

        this.detach();

        this.portal = this.portal || new TemplatePortal(tooltipContentTemplateRef(), this.viewContainerRef);

        this.instance = this.overlayRef.attach(this.portal);
    }

    private detach(): void {
        if (this.overlayRef?.hasAttached()) {
            this.overlayRef.detach();
        }
    }

    private hide(): void {
        this.instance?.destroy();
    }

    private readonly onIsOpenChangeEffect = effect(() => {
        const isOpen = this.isOpen();

        if (isOpen) {
            this.show();
        } else {
            this.hide();
        }
    });
}
