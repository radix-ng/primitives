import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    computed,
    contentChild,
    DestroyRef,
    Directive,
    effect,
    forwardRef,
    inject,
    InjectionToken,
    input,
    OnInit,
    output,
    signal,
    untracked,
    ViewContainerRef,
    ViewRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { asyncScheduler, filter } from 'rxjs';
import { RdxTooltipArrowToken } from './tooltip-arrow.token';
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
    private readonly destroyRef = inject(DestroyRef);
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
    tooltipArrowDirective = contentChild(RdxTooltipArrowToken);

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

    private handleOverlayKeydown(): void {
        if (!this.overlayRef) {
            return;
        }

        this.overlayRef
            .keydownEvents()
            .pipe(
                filter((event) => event.key === 'Escape'),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((event) => {
                this.tooltipContentDirective().onEscapeKeyDown.emit(event);
                console.log(event);

                if (!event.defaultPrevented) {
                    this.handleClose();
                }
            });
    }

    private handlePointerDownOutside(): void {
        if (!this.overlayRef) {
            return;
        }

        this.overlayRef
            .outsidePointerEvents()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => this.tooltipContentDirective().onPointerDownOutside.emit(event));
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
            .withFlexibleDimensions(false)
            .withPositions([
                this.tooltipContentDirective().position()
            ])
            .withLockedPosition();

        this.overlayRef = this.overlay.create({
            direction: undefined,
            positionStrategy: strategy,
            scrollStrategy: this.overlay.scrollStrategies.close()
        });

        this.overlayRef.detachments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.detach);

        this.handleOverlayKeydown();
        this.handlePointerDownOutside();

        return this.overlayRef;
    }

    private show(): void {
        this.overlayRef = this.createOverlayRef();

        this.detach();

        this.portal =
            this.portal ||
            new TemplatePortal(this.tooltipContentDirective().templateRef, this.viewContainerRef, {
                state: this.state,
                side: this.tooltipContentDirective().side
            });

        this.instance = this.overlayRef.attach(this.portal);
    }

    private detach(): void {
        if (this.overlayRef?.hasAttached()) {
            this.overlayRef.detach();
        }
    }

    private hide(): void {
        asyncScheduler.schedule(() => {
            this.instance?.destroy();
        }, this.tooltipConfig.hideDelayDuration ?? 0);
    }

    private readonly onIsOpenChangeEffect = effect(() => {
        const isOpen = this.isOpen();

        untracked(() => {
            if (isOpen) {
                this.show();
            } else {
                this.hide();
            }
        });
    });

    private readonly onArrowDirectiveChangeEffect = effect(() => {
        const arrowDirective = this.tooltipArrowDirective();
        const side = this.tooltipContentDirective().side();

        if (arrowDirective === undefined) {
            return;
        }

        untracked(() => {
            arrowDirective.positioning({ side });
        });
    });
}
