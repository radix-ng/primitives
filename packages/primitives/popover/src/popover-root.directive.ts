import { ConnectedPosition, Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
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
    signal,
    untracked,
    ViewContainerRef,
    ViewRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import { RdxPopoverContentToken } from './popover-content.token';
import { RdxPopoverTriggerDirective } from './popover-trigger.directive';
import { RdxPopoverState } from './popover.types';

export const RdxPopoverRootToken = new InjectionToken<RdxPopoverRootDirective>('RdxPopoverRootToken');

export function injectPopoverRoot(): RdxPopoverRootDirective {
    return inject(RdxPopoverRootToken);
}

@Directive({
    selector: '[rdxPopoverRoot]',
    standalone: true,
    providers: [
        {
            provide: RdxPopoverRootToken,
            useExisting: forwardRef(() => RdxPopoverRootDirective)
        }
    ],
    exportAs: 'rdxPopoverRoot'
})
export class RdxPopoverRootDirective implements OnInit {
    /** @ignore */
    private readonly viewContainerRef = inject(ViewContainerRef);
    /** @ignore */
    private readonly destroyRef = inject(DestroyRef);
    /** @ignore */
    private readonly overlay = inject(Overlay);
    /** @ignore */
    private readonly document = inject(DOCUMENT);

    /**
     * The open state of the popover when it is initially rendered. Use when you do not need to control its open state.
     */
    readonly defaultOpen = input<boolean>(false);

    /**
     * The controlled open state of the popover. Must be used in conjunction with onOpenChange.
     */
    readonly open = input<boolean | undefined>();

    /**
     * Event handler called when the open state of the popover changes.
     */
    readonly onOpenChange = output<boolean>();

    /** @ignore */
    readonly isOpen = signal<boolean>(this.defaultOpen());
    /** @ignore */
    readonly state = computed<RdxPopoverState>(() => {
        const currentIsOpen = this.isOpen();

        if (currentIsOpen) {
            return 'open';
        }

        return 'closed';
    });
    /** @ignore */
    readonly popoverContentDirective = contentChild.required(RdxPopoverContentToken);
    /** @ignore */
    readonly popoverTriggerElementRef = contentChild.required(RdxPopoverTriggerDirective, { read: ElementRef });

    /** @ignore */
    private overlayRef?: OverlayRef;
    /** @ignore */
    private instance?: ViewRef;
    /** @ignore */
    private portal: TemplatePortal<unknown>;
    /** @ignore */
    private isControlledExternally = computed(() => signal(this.open() !== undefined));

    /** @ignore */
    ngOnInit(): void {
        if (this.defaultOpen()) {
            this.handleOpen();
        }
    }

    controlledExternally() {
        return this.isControlledExternally().asReadonly();
    }

    /** @ignore */
    handleOpen(): void {
        if (this.isControlledExternally()()) {
            return;
        }
        this.setOpen(true);
    }

    /** @ignore */
    handleClose(): void {
        if (this.isControlledExternally()()) {
            return;
        }
        this.setOpen(false);
    }

    /** @ignore */
    handleToggle(): void {
        if (this.isControlledExternally()()) {
            return;
        }
        this.isOpen() ? this.handleClose() : this.handleOpen();
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
                this.popoverContentDirective().onEscapeKeyDown.emit(event);

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
            .subscribe((event) => this.popoverContentDirective().onPointerDownOutside.emit(event));
    }

    /** @ignore */
    private setOpen(open = false): void {
        if (open) {
            this.document.dispatchEvent(new CustomEvent('popover.open'));
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
            positionStrategy: this.getPositionStrategy(this.popoverContentDirective().position()),
            scrollStrategy: this.overlay.scrollStrategies.reposition({})
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
            new TemplatePortal(this.popoverContentDirective().templateRef, this.viewContainerRef, {
                state: this.state,
                side: this.popoverContentDirective().side
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
        if (this.isControlledExternally()() && this.open()) {
            return;
        }
        this.instance?.destroy();
    }

    /** @ignore */
    private getPositionStrategy(
        connectedPosition: ConnectedPosition,
        altConnectedPositions: ConnectedPosition[] = []
    ): PositionStrategy {
        const positions = [
            connectedPosition,
            ...altConnectedPositions
        ];
        console.log('positions', positions);
        return this.overlay
            .position()
            .flexibleConnectedTo(this.popoverTriggerElementRef())
            .withFlexibleDimensions(false)
            .withPositions(positions)
            .withLockedPosition(true);
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
        const position = this.popoverContentDirective().position();

        untracked(() => {
            if (this.overlayRef) {
                const positionStrategy = this.getPositionStrategy(position);

                this.overlayRef.updatePositionStrategy(positionStrategy);
            }
        });
    });

    /** @ignore */
    private readonly onOpenChangeEffect = effect(() => {
        const currentOpen = this.open();

        untracked(() => {
            this.isControlledExternally().set(currentOpen !== undefined);
            if (this.isControlledExternally()()) {
                this.setOpen(currentOpen);
            }
        });
    });
}
