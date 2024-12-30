import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { CdkConnectedOverlay, Overlay } from '@angular/cdk/overlay';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    numberAttribute,
    OnInit,
    output,
    SimpleChange,
    TemplateRef,
    untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    getAllPossibleConnectedPositions,
    getContentPosition,
    RDX_POSITIONING_DEFAULTS,
    RdxPositionAlign,
    RdxPositionSide,
    RdxPositionSideAndAlignOffsets
} from '@radix-ng/primitives/core';
import { filter, tap } from 'rxjs';
import { injectTooltipRoot } from './tooltip-root.inject';
import { RdxTooltipAttachDetachEvent } from './tooltip.types';

@Directive({
    selector: '[rdxTooltipContent]',
    hostDirectives: [
        CdkConnectedOverlay
    ]
})
export class RdxTooltipContentDirective implements OnInit {
    /** @ignore */
    private readonly rootDirective = injectTooltipRoot();
    /** @ignore */
    private readonly templateRef = inject(TemplateRef);
    /** @ignore */
    private readonly overlay = inject(Overlay);
    /** @ignore */
    private readonly destroyRef = inject(DestroyRef);
    /** @ignore */
    private readonly connectedOverlay = inject(CdkConnectedOverlay);

    /** @ignore */
    readonly name = computed(() => `rdx-tooltip-trigger-${this.rootDirective.uniqueId()}`);

    /**
     * @description The preferred side of the trigger to render against when open. Will be reversed when collisions occur and avoidCollisions is enabled.
     * @default top
     */
    readonly side = input<RdxPositionSide>(RdxPositionSide.Top);
    /**
     * @description The distance in pixels from the trigger.
     * @default undefined
     */
    readonly sideOffset = input<number, NumberInput>(NaN, {
        transform: numberAttribute
    });
    /**
     * @description The preferred alignment against the trigger. May change when collisions occur.
     * @default center
     */
    readonly align = input<RdxPositionAlign>(RdxPositionAlign.Center);
    /**
     * @description An offset in pixels from the "start" or "end" alignment options.
     * @default undefined
     */
    readonly alignOffset = input<number, NumberInput>(NaN, {
        transform: numberAttribute
    });

    /**
     * @description Whether to add some alternate positions of the content.
     * @default false
     */
    readonly alternatePositionsDisabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @description Whether to prevent `onOverlayEscapeKeyDown` handler from calling. */
    readonly onOverlayEscapeKeyDownDisabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    /** @description Whether to prevent `onOverlayOutsideClick` handler from calling. */
    readonly onOverlayOutsideClickDisabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * @description Event handler called when the escape key is down.
     * It can be prevented by setting `onOverlayEscapeKeyDownDisabled` input to `true`.
     */
    readonly onOverlayEscapeKeyDown = output<KeyboardEvent>();
    /**
     * @description Event handler called when a pointer event occurs outside the bounds of the component.
     * It can be prevented by setting `onOverlayOutsideClickDisabled` input to `true`.
     */
    readonly onOverlayOutsideClick = output<MouseEvent>();

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
        this.onOriginChangeEffect();
        this.onPositionChangeEffect();
    }

    /** @ignore */
    ngOnInit() {
        this.setScrollStrategy();
        this.setHasBackdrop();
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
                filter(
                    () =>
                        !this.onOverlayEscapeKeyDownDisabled() &&
                        !this.rootDirective.rdxCdkEventService?.primitivePreventedFromCdkEvent(
                            this.rootDirective,
                            'cdkOverlayEscapeKeyDown'
                        )
                ),
                filter((event) => event.key === 'Escape'),
                tap((event) => {
                    this.onOverlayEscapeKeyDown.emit(event);
                }),
                filter(() => !this.rootDirective.firstDefaultOpen()),
                tap(() => {
                    this.rootDirective.handleClose();
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
                filter(
                    () =>
                        !this.onOverlayOutsideClickDisabled() &&
                        !this.rootDirective.rdxCdkEventService?.primitivePreventedFromCdkEvent(
                            this.rootDirective,
                            'cdkOverlayOutsideClick'
                        )
                ),
                /**
                 * Handle the situation when an anchor is added and the anchor becomes the origin of the overlay
                 * hence  the trigger will be considered the outside element
                 */
                filter((event) => {
                    return (
                        !this.rootDirective.anchorDirective() ||
                        !this.rootDirective
                            .triggerDirective()
                            .elementRef.nativeElement.contains(event.target as Element)
                    );
                }),
                tap((event) => {
                    this.onOverlayOutsideClick.emit(event);
                }),
                filter(() => !this.rootDirective.firstDefaultOpen()),
                tap(() => {
                    this.rootDirective.handleClose();
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
                    /**
                     * `this.onOpen.emit();` is being delegated to the rootDirective directive due to the opening animation
                     */
                    this.rootDirective.attachDetachEvent.set(RdxTooltipAttachDetachEvent.ATTACH);
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
                    /**
                     * `this.onClosed.emit();` is being delegated to the rootDirective directive due to the closing animation
                     */
                    this.rootDirective.attachDetachEvent.set(RdxTooltipAttachDetachEvent.DETACH);
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
    private setHasBackdrop() {
        const prevHasBackdrop = this.connectedOverlay.hasBackdrop;
        this.connectedOverlay.hasBackdrop = false;
        this.fireOverlayNgOnChanges('hasBackdrop', this.connectedOverlay.hasBackdrop, prevHasBackdrop);
    }

    /** @ignore */
    private setDisableClose() {
        const prevDisableClose = this.connectedOverlay.disableClose;
        this.connectedOverlay.disableClose = true;
        this.fireOverlayNgOnChanges('disableClose', this.connectedOverlay.disableClose, prevDisableClose);
    }

    /** @ignore */
    private setOrigin(origin: CdkConnectedOverlay['origin']) {
        const prevOrigin = this.connectedOverlay.origin;
        this.connectedOverlay.origin = origin;
        this.fireOverlayNgOnChanges('origin', this.connectedOverlay.origin, prevOrigin);
    }

    /** @ignore */
    private setPositions(positions: CdkConnectedOverlay['positions']) {
        const prevPositions = this.connectedOverlay.positions;
        this.connectedOverlay.positions = positions;
        this.fireOverlayNgOnChanges('positions', this.connectedOverlay.positions, prevPositions);
        this.connectedOverlay.overlayRef?.updatePosition();
    }

    /** @ignore */
    private computePositions() {
        const arrowHeight = this.rootDirective.arrowDirective()?.height() ?? 0;
        const offsets: RdxPositionSideAndAlignOffsets = {
            sideOffset: isNaN(this.sideOffset())
                ? arrowHeight || RDX_POSITIONING_DEFAULTS.offsets.side
                : this.sideOffset(),
            alignOffset: isNaN(this.alignOffset()) ? RDX_POSITIONING_DEFAULTS.offsets.align : this.alignOffset()
        };
        const basePosition = getContentPosition({
            side: this.side(),
            align: this.align(),
            sideOffset: offsets.sideOffset,
            alignOffset: offsets.alignOffset
        });
        const positions = [basePosition];
        if (!this.alternatePositionsDisabled()) {
            /**
             * Alternate positions for better user experience along the X/Y axis (e.g. vertical/horizontal scrolling)
             */
            const allPossibleConnectedPositions = getAllPossibleConnectedPositions();
            allPossibleConnectedPositions.forEach((_, key) => {
                const sideAndAlignArray = key.split('|');
                if (
                    (sideAndAlignArray[0] as RdxPositionSide) !== this.side() ||
                    (sideAndAlignArray[1] as RdxPositionAlign) !== this.align()
                ) {
                    positions.push(
                        getContentPosition({
                            side: sideAndAlignArray[0] as RdxPositionSide,
                            align: sideAndAlignArray[1] as RdxPositionAlign,
                            sideOffset: offsets.sideOffset,
                            alignOffset: offsets.alignOffset
                        })
                    );
                }
            });
        }
        return positions;
    }

    private onOriginChangeEffect() {
        effect(() => {
            const origin = (this.rootDirective.anchorDirective() ?? this.rootDirective.triggerDirective())
                .overlayOrigin;
            untracked(() => {
                this.setOrigin(origin);
            });
        });
    }

    /** @ignore */
    private onPositionChangeEffect() {
        effect(() => {
            const positions = this.positions();
            this.alternatePositionsDisabled();
            untracked(() => {
                this.setPositions(positions);
            });
        });
    }

    /** @ignore */
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
