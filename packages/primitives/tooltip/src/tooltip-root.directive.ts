import { ConnectedPosition, Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    computed,
    contentChild,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
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
import { asyncScheduler, filter } from 'rxjs';
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
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly overlay = inject(Overlay);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly document = inject(DOCUMENT);
    readonly tooltipConfig = injectTooltipConfig();

    readonly defaultOpen = input<boolean>(false);
    readonly open = input<boolean | undefined>();
    readonly delayDuration = input<number>(this.tooltipConfig.delayDuration);
    readonly disableHoverableContent = input<boolean>(this.tooltipConfig.disableHoverableContent ?? false);
    readonly onOpenChange = output<boolean>();

    readonly isOpen = signal<boolean>(this.defaultOpen());
    readonly isOpenDelayed = signal<boolean>(true);
    readonly wasOpenDelayed = signal<boolean>(false);
    readonly state = computed<RdxTooltipState>(() => {
        const currentIsOpen = this.isOpen();
        const currentWasOpenDelayed = this.wasOpenDelayed();

        if (currentIsOpen) {
            return currentWasOpenDelayed ? 'delayed-open' : 'instant-open';
        }

        return 'closed';
    });
    readonly tooltipContentDirective = contentChild.required(RdxTooltipContentToken);
    readonly tooltipTriggerElementRef = contentChild.required(RdxTooltipTriggerDirective, { read: ElementRef });

    private openTimer = 0;
    private skipDelayTimer = 0;
    private overlayRef?: OverlayRef;
    private instance?: ViewRef;
    private portal: TemplatePortal<unknown>;
    private isControlledExternally = false;

    ngOnInit(): void {
        if (this.defaultOpen()) {
            this.handleOpen();
        }

        this.isControlledExternally = this.open() !== undefined;
    }

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

    onTriggerLeave(): void {
        this.clearTimeout(this.openTimer);
        this.handleClose();
    }

    onOpen(): void {
        this.clearTimeout(this.skipDelayTimer);
        this.isOpenDelayed.set(false);
    }

    onClose(): void {
        this.clearTimeout(this.skipDelayTimer);

        if (isPlatformBrowser(this.platformId)) {
            this.skipDelayTimer = window.setTimeout(() => {
                this.isOpenDelayed.set(true);
            }, this.tooltipConfig.skipDelayDuration);
        }
    }

    handleOpen(): void {
        if (this.isControlledExternally) {
            return;
        }

        this.wasOpenDelayed.set(false);
        this.setOpen(true);
    }

    handleClose(): void {
        if (this.isControlledExternally) {
            return;
        }

        this.clearTimeout(this.openTimer);
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
        this.clearTimeout(this.openTimer);

        if (isPlatformBrowser(this.platformId)) {
            this.openTimer = window.setTimeout(() => {
                this.wasOpenDelayed.set(true);
                this.setOpen(true);
            }, this.delayDuration());
        }
    }

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
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.detach());

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
        if (this.isControlledExternally && this.open()) {
            return;
        }

        asyncScheduler.schedule(() => {
            this.instance?.destroy();
        }, this.tooltipConfig.hideDelayDuration ?? 0);
    }

    private getPositionStrategy(connectedPosition: ConnectedPosition): PositionStrategy {
        return this.overlay
            .position()
            .flexibleConnectedTo(this.tooltipTriggerElementRef())
            .withFlexibleDimensions(false)
            .withPositions([
                connectedPosition
            ])
            .withLockedPosition();
    }

    private clearTimeout(timeoutId: number): void {
        if (isPlatformBrowser(this.platformId)) {
            window.clearTimeout(timeoutId);
        }
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

    private readonly onPositionChangeEffect = effect(() => {
        const position = this.tooltipContentDirective().position();

        if (this.overlayRef) {
            const positionStrategy = this.getPositionStrategy(position);

            this.overlayRef.updatePositionStrategy(positionStrategy);
        }
    });

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
