import { CdkConnectedOverlay, Overlay } from '@angular/cdk/overlay';
import {
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    OnInit,
    output,
    SimpleChange,
    TemplateRef,
    untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs';
import { injectPopoverRoot } from './popover-root.inject';
import { DEFAULTS } from './popover.constants';
import { RdxPopoverAlign, RdxPopoverSide, RdxSideAndAlignOffsets } from './popover.types';
import { getAllPossibleConnectedPositions, getContentPosition, isRdxPopoverDevMode } from './popover.utils';

@Directive({
    selector: '[rdxPopoverContent]',
    standalone: true,
    hostDirectives: [
        CdkConnectedOverlay
    ]
})
export class RdxPopoverContentDirective implements OnInit {
    /** @ignore */
    private readonly popoverRoot = injectPopoverRoot();
    /** @ignore */
    private readonly templateRef = inject(TemplateRef);
    /** @ignore */
    private readonly overlay = inject(Overlay);
    /** @ignore */
    private readonly destroyRef = inject(DestroyRef);
    /** @ignore */
    private readonly connectedOverlay = inject(CdkConnectedOverlay);

    /**
     * The preferred side of the trigger to render against when open. Will be reversed when collisions occur and avoidCollisions is enabled.
     */
    readonly side = input<RdxPopoverSide>(RdxPopoverSide.Top);
    /**
     * The distance in pixels from the trigger.
     */
    readonly sideOffset = input<number | undefined>(void 0);

    /**
     * The preferred alignment against the trigger. May change when collisions occur.
     */
    readonly align = input<RdxPopoverAlign>(RdxPopoverAlign.Center);
    /**
     * An offset in pixels from the "start" or "end" alignment options.
     */
    readonly alignOffset = input<number | undefined>(void 0);

    /**
     * Whether to add some alternate positions of the content.
     */
    readonly disableAlternatePositions = input(false);

    /** @ingore */
    readonly positions = computed(() => {
        isRdxPopoverDevMode() &&
            console.log(this.popoverRoot.uniqueId(), '[inputs]', {
                side: this.side(),
                align: this.align(),
                sideOffset: this.sideOffset(),
                alignOffset: this.alignOffset()
            });
        const greatestDimensionFromTheArrow = Math.max(
            this.popoverRoot.popoverArrowDirective()?.width() ?? 0,
            this.popoverRoot.popoverArrowDirective()?.height() ?? 0
        );
        const offsets: RdxSideAndAlignOffsets = {
            sideOffset: this.sideOffset() ?? (greatestDimensionFromTheArrow || DEFAULTS.offsets.side),
            alignOffset: this.alignOffset() ?? DEFAULTS.offsets.align
        };
        isRdxPopoverDevMode() && console.log(this.popoverRoot.uniqueId(), '[offsets]', offsets);
        isRdxPopoverDevMode() &&
            console.log(this.popoverRoot.uniqueId(), '[computed inputs]', {
                side: this.side(),
                align: this.align(),
                sideOffset: offsets.sideOffset,
                alignOffset: offsets.alignOffset
            });
        const basePosition = getContentPosition({
            side: this.side(),
            align: this.align(),
            sideOffset: offsets.sideOffset,
            alignOffset: offsets.alignOffset
        });
        isRdxPopoverDevMode() && console.log(this.popoverRoot.uniqueId(), '[basePosition]', basePosition);
        const positions = [basePosition];
        if (!this.disableAlternatePositions()) {
            /**
             * Alternate positions for better user experience along the X/Y axis (e.g. vertical/horizontal scrolling)
             */
            const allPossibleConnectedPositions = getAllPossibleConnectedPositions();
            allPossibleConnectedPositions.forEach((_, key) => {
                const sideAndAlignArray = key.split('|');
                if (
                    (sideAndAlignArray[0] as RdxPopoverSide) !== this.side() ||
                    (sideAndAlignArray[1] as RdxPopoverAlign) !== this.align()
                ) {
                    positions.push(
                        getContentPosition({
                            side: sideAndAlignArray[0] as RdxPopoverSide,
                            align: sideAndAlignArray[1] as RdxPopoverAlign,
                            sideOffset: offsets.sideOffset,
                            alignOffset: offsets.alignOffset
                        })
                    );
                }
            });
        }
        isRdxPopoverDevMode() && console.log(this.popoverRoot.uniqueId(), '[positions]', positions);
        return positions;
    });

    /**
     * Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.
     */
    readonly onEscapeKeyDown = output<KeyboardEvent>();

    /**
     * Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.
     */
    readonly onPointerDownOutside = output<MouseEvent>();

    /**
     * Event handler called when the overlay is atached
     */
    readonly onShow = output<void>();
    /**
     * Event handler called when the overlay is detached
     */
    readonly onHide = output<void>();

    constructor() {
        this.onPositionChangeEffect();
    }

    /** @ignore */
    ngOnInit() {
        this.setOrigin();
        this.setScrollStrategy();
        this.setDisableClose();
        this.onAttach();
        this.onDetach();
        this.connectKeydownEscape();
        this.connectOutsideClick();
    }

    /** @ignore */
    show() {
        if (this.connectedOverlay.open) {
            return;
        }
        const prevOpen = this.connectedOverlay.open;
        this.connectedOverlay.open = true;
        this.connectedOverlay.ngOnChanges({ open: new SimpleChange(prevOpen, true, false) });
    }

    /** @ignore */
    hide() {
        if (!this.connectedOverlay.open) {
            return;
        }
        const prevOpen = this.connectedOverlay.open;
        this.connectedOverlay.open = false;
        this.connectedOverlay.ngOnChanges({ open: new SimpleChange(prevOpen, false, false) });
    }

    /** @ignore */
    positionChange() {
        return this.connectedOverlay.positionChange.asObservable();
    }

    /** @ignore */
    private connectKeydownEscape() {
        this.connectedOverlay.overlayKeydown
            .asObservable()
            .pipe(
                filter((event) => event.key === 'Escape'),
                tap((event) => {
                    this.onEscapeKeyDown.emit(event);
                    if (!event.defaultPrevented) {
                        this.popoverRoot.handleClose();
                    }
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    /** @ignore */
    private connectOutsideClick() {
        this.connectedOverlay.overlayOutsideClick
            .asObservable()
            .pipe(
                tap((event) => {
                    this.onPointerDownOutside.emit(event);
                    if (!event.defaultPrevented) {
                        this.popoverRoot.handleClose();
                    }
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    /** @ignore */
    private onAttach() {
        this.connectedOverlay.attach
            .asObservable()
            .pipe(
                tap(() => {
                    this.onShow.emit();
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    /** @ignore */
    private onDetach() {
        this.connectedOverlay.detach
            .asObservable()
            .pipe(
                tap(() => {
                    this.onHide.emit();
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    /** @ignore */
    private setScrollStrategy() {
        const prevScrollStrategy = this.connectedOverlay.scrollStrategy;
        this.connectedOverlay.scrollStrategy = this.overlay.scrollStrategies.reposition();
        this.connectedOverlay.ngOnChanges({
            scrollStrategy: new SimpleChange(prevScrollStrategy, this.connectedOverlay.scrollStrategy, false)
        });
    }

    /** @ignore */
    private setDisableClose() {
        const prevDisableClose = this.connectedOverlay.disableClose;
        this.connectedOverlay.disableClose = true;
        this.connectedOverlay.ngOnChanges({
            disableClose: new SimpleChange(prevDisableClose, this.connectedOverlay.disableClose, false)
        });
    }

    /** @ignore */
    private setOrigin() {
        const prevOrigin = this.connectedOverlay.origin;
        this.connectedOverlay.origin = this.popoverRoot.popoverTriggerDirective().overlayOrigin;
        this.connectedOverlay.ngOnChanges({
            origin: new SimpleChange(prevOrigin, this.connectedOverlay.origin, false)
        });
    }

    /** @ignore */
    private onPositionChangeEffect() {
        effect(() => {
            const positions = this.positions();
            this.disableAlternatePositions();
            untracked(() => {
                const prevPositions = this.connectedOverlay.positions;
                this.connectedOverlay.positions = positions;
                this.connectedOverlay.ngOnChanges({
                    positions: new SimpleChange(prevPositions, this.connectedOverlay.positions, false)
                });
                this.connectedOverlay.overlayRef?.updatePosition();
            });
        });
    }
}
