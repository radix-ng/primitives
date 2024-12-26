import { ConnectedPosition, Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
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
    PLATFORM_ID,
    signal,
    untracked,
    ViewContainerRef,
    ViewRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { injectDocument } from '@radix-ng/primitives/core';
import { asyncScheduler, filter, take } from 'rxjs';
import { RdxTooltipContentToken } from './tooltip-content.token';
import { RdxTooltipTriggerDirective } from './tooltip-trigger.directive';
import { injectTooltipConfig } from './tooltip.config';
import { RdxTooltipState } from './tooltip.types';

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
    /** @ignore */
    private readonly viewContainerRef = inject(ViewContainerRef);
    /** @ignore */
    private readonly destroyRef = inject(DestroyRef);
    /** @ignore */
    private readonly overlay = inject(Overlay);
    /** @ignore */
    private readonly platformId = inject(PLATFORM_ID);
    /** @ignore */
    private readonly document = injectDocument();
    /** @ignore */
    readonly tooltipConfig = injectTooltipConfig();

    /**
     * The open state of the tooltip when it is initially rendered. Use when you do not need to control its open state.
     */
    readonly defaultOpen = input<boolean>(false);

    /**
     * The controlled open state of the tooltip. Must be used in conjunction with onOpenChange.
     */
    readonly open = input<boolean | undefined>();

    /**
     * Override the duration given to the configuration to customise the open delay for a specific tooltip.
     */
    readonly delayDuration = input<number>(this.tooltipConfig.delayDuration);

    /** @ignore */
    readonly disableHoverableContent = input<boolean>(this.tooltipConfig.disableHoverableContent ?? false);

    /**
     * Event handler called when the open state of the tooltip changes.
     */
    readonly onOpenChange = output<boolean>();

    /** @ignore */
    readonly isOpen = signal<boolean>(this.defaultOpen());
    /** @ignore */
    readonly isOpenDelayed = signal<boolean>(true);
    /** @ignore */
    readonly wasOpenDelayed = signal<boolean>(false);
    /** @ignore */
    readonly state = computed<RdxTooltipState>(() => {
        const currentIsOpen = this.isOpen();
        const currentWasOpenDelayed = this.wasOpenDelayed();

        if (currentIsOpen) {
            return currentWasOpenDelayed ? 'delayed-open' : 'instant-open';
        }

        return 'closed';
    });
    /** @ignore */
    readonly tooltipContentDirective = contentChild.required(RdxTooltipContentToken);
    /** @ignore */
    readonly tooltipTriggerDirective = contentChild.required(RdxTooltipTriggerDirective);

    /** @ignore */
    private openTimer = 0;
    /** @ignore */
    private skipDelayTimer = 0;
    /** @ignore */
    private overlayRef?: OverlayRef;
    /** @ignore */
    private instance?: ViewRef;
    /** @ignore */
    private portal: TemplatePortal<unknown>;
    /** @ignore */
    private isControlledExternally = false;

    /** @ignore */
    ngOnInit(): void {
        if (this.defaultOpen()) {
            this.handleOpen();
        }

        this.isControlledExternally = this.open() !== undefined;
    }

    /** @ignore */
    onTriggerEnter(): void {
        if (this.isControlledExternally) {
            return;
        }

        if (this.isOpenDelayed()) {
            this.handleDelayedOpen();
        } else {
            this.handleOpen();
        }
    }

    /** @ignore */
    onTriggerLeave(): void {
        this.clearTimeout(this.openTimer);
        this.handleClose();
    }

    /** @ignore */
    onOpen(): void {
        this.clearTimeout(this.skipDelayTimer);
        this.isOpenDelayed.set(false);
    }

    /** @ignore */
    onClose(): void {
        this.clearTimeout(this.skipDelayTimer);

        if (isPlatformBrowser(this.platformId)) {
            this.skipDelayTimer = window.setTimeout(() => {
                this.isOpenDelayed.set(true);
            }, this.tooltipConfig.skipDelayDuration);
        }
    }

    /** @ignore */
    handleOpen(): void {
        if (this.isControlledExternally) {
            return;
        }

        this.wasOpenDelayed.set(false);
        this.setOpen(true);
    }

    /** @ignore */
    handleClose(): void {
        if (this.isControlledExternally) {
            return;
        }

        this.clearTimeout(this.openTimer);
        this.setOpen(false);
    }

    /** @ignore */
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

                if (!event.defaultPrevented) {
                    this.handleClose();
                }
            });
    }

    /** @ignore */
    private handlePointerDownOutside(): void {
        if (!this.overlayRef) {
            return;
        }

        this.overlayRef
            .outsidePointerEvents()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => this.tooltipContentDirective().onPointerDownOutside.emit(event));
    }

    /** @ignore */
    private handleDelayedOpen(): void {
        this.clearTimeout(this.openTimer);

        if (isPlatformBrowser(this.platformId)) {
            this.openTimer = window.setTimeout(() => {
                this.wasOpenDelayed.set(true);
                this.setOpen(true);
            }, this.delayDuration());
        }
    }

    /** @ignore */
    private setOpen(open = false): void {
        if (open) {
            this.onOpen();

            this.document.dispatchEvent(new CustomEvent('tooltip.open'));
        } else {
            this.onClose();
        }

        this.isOpen.set(open);
        this.onOpenChange.emit(open);
    }

    /** @ignore */
    private createOverlayRef(): OverlayRef {
        if (this.overlayRef) {
            return this.overlayRef;
        }

        this.overlayRef = this.overlay.create({
            direction: undefined,
            positionStrategy: this.getPositionStrategy(this.tooltipContentDirective().position()),
            scrollStrategy: this.overlay.scrollStrategies.close()
        });

        this.overlayRef
            .detachments()
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.detach());

        this.handleOverlayKeydown();
        this.handlePointerDownOutside();

        return this.overlayRef;
    }

    /** @ignore */
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

    /** @ignore */
    private detach(): void {
        if (this.overlayRef?.hasAttached()) {
            this.overlayRef.detach();
        }
    }

    /** @ignore */
    private hide(): void {
        if (this.isControlledExternally && this.open()) {
            return;
        }

        asyncScheduler.schedule(() => {
            this.instance?.destroy();
        }, this.tooltipConfig.hideDelayDuration ?? 0);
    }

    /** @ignore */
    private getPositionStrategy(connectedPosition: ConnectedPosition): PositionStrategy {
        return this.overlay
            .position()
            .flexibleConnectedTo(this.tooltipTriggerDirective().elementRef)
            .withFlexibleDimensions(false)
            .withPositions([
                connectedPosition
            ])
            .withLockedPosition();
    }

    /** @ignore */
    private clearTimeout(timeoutId: number): void {
        if (isPlatformBrowser(this.platformId)) {
            window.clearTimeout(timeoutId);
        }
    }

    /** @ignore */
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

    /** @ignore */
    private readonly onPositionChangeEffect = effect(() => {
        const position = this.tooltipContentDirective().position();

        if (this.overlayRef) {
            const positionStrategy = this.getPositionStrategy(position);

            this.overlayRef.updatePositionStrategy(positionStrategy);
        }
    });

    /** @ignore */
    private readonly onOpenChangeEffect = effect(() => {
        const currentOpen = this.open();
        this.isControlledExternally = currentOpen !== undefined;

        untracked(() => {
            if (this.isControlledExternally) {
                this.setOpen(currentOpen);
            }
        });
    });
}
