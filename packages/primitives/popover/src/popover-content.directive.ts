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
import { RdxPopoverAlign, RdxPopoverAttachDetachEvent, RdxPopoverSide, RdxSideAndAlignOffsets } from './popover.types';
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
     * @description The preferred side of the trigger to render against when open. Will be reversed when collisions occur and avoidCollisions is enabled.
     * @default top
     */
    readonly side = input<RdxPopoverSide>(RdxPopoverSide.Top);
    /**
     * @description The distance in pixels from the trigger.
     * @default undefined
     */
    readonly sideOffset = input<number | undefined>(void 0);
    /**
     * @description The preferred alignment against the trigger. May change when collisions occur.
     * @default center
     */
    readonly align = input<RdxPopoverAlign>(RdxPopoverAlign.Center);
    /**
     * @description An offset in pixels from the "start" or "end" alignment options.
     * @default undefined
     */
    readonly alignOffset = input<number | undefined>(void 0);

    /**
     * @description Whether to add some alternate positions of the content.
     * @default false
     */
    readonly disableAlternatePositions = input(false);

    /**
     * @description Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.
     */
    readonly onEscapeKeyDown = output<KeyboardEvent>();

    /**
     * @description Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.
     */
    readonly onOutsideClick = output<MouseEvent>();

    /**
     * @description Event handler called after the overlay is open
     */
    readonly onOpen = output<void>();
    /**
     * @description Event handler called after the overlay is closed
     */
    readonly onClosed = output<void>();

    /** @ingore */
    readonly positions = computed(() => this.computePositions());

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
    open() {
        if (this.connectedOverlay.open) {
            return;
        }
        const prevOpen = this.connectedOverlay.open;
        this.connectedOverlay.open = true;
        this.fireOverlayNgOnChanges('open', this.connectedOverlay.open, prevOpen);
    }

    /** @ignore */
    close() {
        if (!this.connectedOverlay.open) {
            return;
        }
        const prevOpen = this.connectedOverlay.open;
        this.connectedOverlay.open = false;
        this.fireOverlayNgOnChanges('open', this.connectedOverlay.open, prevOpen);
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
                    if (
                        !event.defaultPrevented &&
                        !this.popoverRoot.firstDefaultOpen() &&
                        !event.defaultPreventedCustom
                    ) {
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
                    this.onOutsideClick.emit(event);
                    if (
                        !event.defaultPrevented &&
                        !this.popoverRoot.firstDefaultOpen() &&
                        !event.defaultPreventedCustom
                    ) {
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
                    isRdxPopoverDevMode() &&
                        console.log(
                            this.popoverRoot.uniqueId(),
                            '[content attach]',
                            this.popoverRoot.getAnimationParamsSnapshot()
                        );
                    /**
                     * `this.onOpen.emit();` is being delegated to the root directive due to the open animation
                     */
                    this.popoverRoot.attachDetachEvent.set(RdxPopoverAttachDetachEvent.ATTACH);
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
                    isRdxPopoverDevMode() &&
                        console.log(
                            this.popoverRoot.uniqueId(),
                            '[content detach]',
                            this.popoverRoot.getAnimationParamsSnapshot()
                        );
                    /**
                     * `this.onClosed.emit();` is being delegated to the root directive due to the open animation
                     */
                    this.popoverRoot.attachDetachEvent.set(RdxPopoverAttachDetachEvent.DETACH);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    /** @ignore */
    private setScrollStrategy() {
        const prevScrollStrategy = this.connectedOverlay.scrollStrategy;
        this.connectedOverlay.scrollStrategy = this.overlay.scrollStrategies.reposition();
        this.fireOverlayNgOnChanges('scrollStrategy', this.connectedOverlay.scrollStrategy, prevScrollStrategy);
    }

    /** @ignore */
    private setDisableClose() {
        const prevDisableClose = this.connectedOverlay.disableClose;
        this.connectedOverlay.disableClose = true;
        this.fireOverlayNgOnChanges('disableClose', this.connectedOverlay.disableClose, prevDisableClose);
    }

    /** @ignore */
    private setOrigin() {
        const prevOrigin = this.connectedOverlay.origin;
        this.connectedOverlay.origin = this.popoverRoot.popoverTriggerDirective().overlayOrigin;
        this.fireOverlayNgOnChanges('origin', this.connectedOverlay.origin, prevOrigin);
    }

    /** @ignore */
    private computePositions() {
        isRdxPopoverDevMode() &&
            console.log(
                this.popoverRoot.uniqueId(),
                '[inputs]',
                {
                    side: this.side(),
                    align: this.align(),
                    sideOffset: this.sideOffset(),
                    alignOffset: this.alignOffset()
                },
                this.popoverRoot.getAnimationParamsSnapshot()
            );
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
    }

    /** @ignore */
    private onPositionChangeEffect() {
        effect(() => {
            const positions = this.positions();
            this.disableAlternatePositions();
            untracked(() => {
                const prevPositions = this.connectedOverlay.positions;
                this.connectedOverlay.positions = positions;
                this.fireOverlayNgOnChanges('positions', this.connectedOverlay.positions, prevPositions);
                this.connectedOverlay.overlayRef?.updatePosition();
            });
        });
    }

    private fireOverlayNgOnChanges<K extends keyof CdkConnectedOverlay, V extends CdkConnectedOverlay[K]>(
        input: K,
        currentValue: V,
        previousValue: V,
        firstChange = false
    ) {
        this.connectedOverlay.ngOnChanges({
            [input]: new SimpleChange(previousValue, currentValue, firstChange)
        });
    }
}
