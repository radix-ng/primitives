import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    numberAttribute,
    signal,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounce, map, Subject, tap, timer } from 'rxjs';
import { RdxTooltipAnchorDirective } from './tooltip-anchor.directive';
import { RdxTooltipAnchorToken } from './tooltip-anchor.token';
import { RdxTooltipArrowToken } from './tooltip-arrow.token';
import { RdxTooltipCloseToken } from './tooltip-close.token';
import { RdxTooltipContentAttributesToken } from './tooltip-content-attributes.token';
import { RdxTooltipContentDirective } from './tooltip-content.directive';
import { RdxTooltipTriggerDirective } from './tooltip-trigger.directive';
import {
    RdxTooltipAction,
    RdxTooltipAnimationStatus,
    RdxTooltipAttachDetachEvent,
    RdxTooltipState
} from './tooltip.types';
import { injectRdxCdkEventService } from './utils/cdk-event.service';

let nextId = 0;

@Directive({
    selector: '[rdxTooltipRoot]',
    exportAs: 'rdxTooltipRoot'
})
export class RdxTooltipRootDirective {
    /** @ignore */
    readonly uniqueId = signal(++nextId);
    /** @ignore */
    readonly name = computed(() => `rdx-tooltip-root-${this.uniqueId()}`);

    /**
     * @description The anchor directive that comes form outside the tooltip rootDirective
     * @default undefined
     */
    readonly anchor = input<RdxTooltipAnchorDirective | undefined>(void 0);
    /**
     * @description The open state of the tooltip when it is initially rendered. Use when you do not need to control its open state.
     * @default false
     */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    /**
     * @description The controlled state of the tooltip. `open` input take precedence of `defaultOpen` input.
     * @default undefined
     */
    readonly open = input<boolean | undefined, BooleanInput>(void 0, { transform: booleanAttribute });
    /**
     * To customise the open delay for a specific tooltip.
     */
    readonly openDelay = input<number, NumberInput>(500, {
        transform: numberAttribute
    });
    /**
     * To customise the close delay for a specific tooltip.
     */
    readonly closeDelay = input<number, NumberInput>(200, {
        transform: numberAttribute
    });
    /**
     * @description Whether to control the state of the tooltip from external. Use in conjunction with `open` input.
     * @default undefined
     */
    readonly externalControl = input<boolean | undefined, BooleanInput>(void 0, { transform: booleanAttribute });
    /**
     * @description Whether to take into account CSS opening/closing animations.
     * @default false
     */
    readonly cssAnimation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    /**
     * @description Whether to take into account CSS opening animations. `cssAnimation` input must be set to 'true'
     * @default false
     */
    readonly cssOpeningAnimation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    /**
     * @description Whether to take into account CSS closing animations. `cssAnimation` input must be set to 'true'
     * @default false
     */
    readonly cssClosingAnimation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @ignore */
    readonly cssAnimationStatus = signal<RdxTooltipAnimationStatus | null>(null);

    /** @ignore */
    readonly contentDirective = contentChild.required(RdxTooltipContentDirective);
    /** @ignore */
    readonly triggerDirective = contentChild.required(RdxTooltipTriggerDirective);
    /** @ignore */
    readonly arrowDirective = contentChild(RdxTooltipArrowToken);
    /** @ignore */
    readonly closeDirective = contentChild(RdxTooltipCloseToken);
    /** @ignore */
    readonly contentAttributesComponent = contentChild(RdxTooltipContentAttributesToken);
    /** @ignore */
    private readonly internalAnchorDirective = contentChild(RdxTooltipAnchorToken);

    /** @ignore */
    readonly viewContainerRef = inject(ViewContainerRef);
    /** @ignore */
    readonly rdxCdkEventService = injectRdxCdkEventService();
    /** @ignore */
    readonly destroyRef = inject(DestroyRef);

    /** @ignore */
    readonly state = signal(RdxTooltipState.CLOSED);

    /** @ignore */
    readonly attachDetachEvent = signal(RdxTooltipAttachDetachEvent.DETACH);

    /** @ignore */
    private readonly isFirstDefaultOpen = signal(false);

    /** @ignore */
    readonly anchorDirective = computed(() => this.internalAnchorDirective() ?? this.anchor());

    /** @ignore */
    readonly actionSubject$ = new Subject<RdxTooltipAction>();

    constructor() {
        this.rdxCdkEventService?.registerPrimitive(this);
        this.destroyRef.onDestroy(() => this.rdxCdkEventService?.deregisterPrimitive(this));
        this.actionSubscription();
        this.onStateChangeEffect();
        this.onCssAnimationStatusChangeChangeEffect();
        this.onOpenChangeEffect();
        this.onIsFirstDefaultOpenChangeEffect();
        this.onAnchorChangeEffect();
        this.emitOpenOrClosedEventEffect();
        afterNextRender({
            write: () => {
                if (this.defaultOpen() && !this.open()) {
                    this.isFirstDefaultOpen.set(true);
                }
            }
        });
    }

    /** @ignore */
    getAnimationParamsSnapshot() {
        return {
            cssAnimation: this.cssAnimation(),
            cssOpeningAnimation: this.cssOpeningAnimation(),
            cssClosingAnimation: this.cssClosingAnimation(),
            cssAnimationStatus: this.cssAnimationStatus(),
            attachDetachEvent: this.attachDetachEvent(),
            state: this.state(),
            canEmitOnOpenOrOnClosed: this.canEmitOnOpenOrOnClosed()
        };
    }

    /** @ignore */
    controlledExternally() {
        return this.externalControl;
    }

    /** @ignore */
    firstDefaultOpen() {
        return this.isFirstDefaultOpen();
    }

    /** @ignore */
    handleOpen(): void {
        if (this.externalControl()) {
            return;
        }
        this.actionSubject$.next(RdxTooltipAction.OPEN);
    }

    /** @ignore */
    handleClose(closeButton?: boolean): void {
        if (this.isFirstDefaultOpen()) {
            this.isFirstDefaultOpen.set(false);
        }
        if (!closeButton && this.externalControl()) {
            return;
        }
        this.actionSubject$.next(RdxTooltipAction.CLOSE);
    }

    /** @ignore */
    handleToggle(): void {
        if (this.externalControl()) {
            return;
        }
        this.isOpen() ? this.handleClose() : this.handleOpen();
    }

    /** @ignore */
    isOpen(state?: RdxTooltipState) {
        return (state ?? this.state()) === RdxTooltipState.OPEN;
    }

    /** @ignore */
    private setState(state = RdxTooltipState.CLOSED): void {
        if (state === this.state()) {
            return;
        }
        this.state.set(state);
    }

    /** @ignore */
    private openContent(): void {
        this.contentDirective().open();
        if (!this.cssAnimation() || !this.cssOpeningAnimation()) {
            this.cssAnimationStatus.set(null);
        }
    }

    /** @ignore */
    private closeContent(): void {
        this.contentDirective().close();
        if (!this.cssAnimation() || !this.cssClosingAnimation()) {
            this.cssAnimationStatus.set(null);
        }
    }

    /** @ignore */
    private emitOnOpen(): void {
        this.contentDirective().onOpen.emit();
    }

    /** @ignore */
    private emitOnClosed(): void {
        this.contentDirective().onClosed.emit();
    }

    /** @ignore */
    private ifOpenOrCloseWithoutAnimations(state: RdxTooltipState) {
        return (
            !this.contentAttributesComponent() ||
            !this.cssAnimation() ||
            (this.cssAnimation() && !this.cssClosingAnimation() && state === RdxTooltipState.CLOSED) ||
            (this.cssAnimation() && !this.cssOpeningAnimation() && state === RdxTooltipState.OPEN) ||
            // !this.cssAnimationStatus() ||
            (this.cssOpeningAnimation() &&
                state === RdxTooltipState.OPEN &&
                [RdxTooltipAnimationStatus.OPEN_STARTED].includes(this.cssAnimationStatus()!)) ||
            (this.cssClosingAnimation() &&
                state === RdxTooltipState.CLOSED &&
                [RdxTooltipAnimationStatus.CLOSED_STARTED].includes(this.cssAnimationStatus()!))
        );
    }

    /** @ignore */
    private ifOpenOrCloseWithAnimations(cssAnimationStatus: RdxTooltipAnimationStatus | null) {
        return (
            this.contentAttributesComponent() &&
            this.cssAnimation() &&
            cssAnimationStatus &&
            ((this.cssOpeningAnimation() &&
                this.state() === RdxTooltipState.OPEN &&
                [RdxTooltipAnimationStatus.OPEN_ENDED].includes(cssAnimationStatus)) ||
                (this.cssClosingAnimation() &&
                    this.state() === RdxTooltipState.CLOSED &&
                    [RdxTooltipAnimationStatus.CLOSED_ENDED].includes(cssAnimationStatus)))
        );
    }

    /** @ignore */
    private openOrClose(state: RdxTooltipState) {
        const isOpen = this.isOpen(state);
        isOpen ? this.openContent() : this.closeContent();
    }

    /** @ignore */
    private emitOnOpenOrOnClosed(state: RdxTooltipState) {
        this.isOpen(state)
            ? this.attachDetachEvent() === RdxTooltipAttachDetachEvent.ATTACH && this.emitOnOpen()
            : this.attachDetachEvent() === RdxTooltipAttachDetachEvent.DETACH && this.emitOnClosed();
    }

    /** @ignore */
    private canEmitOnOpenOrOnClosed() {
        return (
            !this.cssAnimation() ||
            (!this.cssOpeningAnimation() && this.state() === RdxTooltipState.OPEN) ||
            (this.cssOpeningAnimation() &&
                this.state() === RdxTooltipState.OPEN &&
                this.cssAnimationStatus() === RdxTooltipAnimationStatus.OPEN_ENDED) ||
            (!this.cssClosingAnimation() && this.state() === RdxTooltipState.CLOSED) ||
            (this.cssClosingAnimation() &&
                this.state() === RdxTooltipState.CLOSED &&
                this.cssAnimationStatus() === RdxTooltipAnimationStatus.CLOSED_ENDED)
        );
    }

    /** @ignore */
    private onStateChangeEffect() {
        let isFirst = true;
        effect(() => {
            const state = this.state();
            untracked(() => {
                if (isFirst) {
                    isFirst = false;
                    return;
                }
                if (!this.ifOpenOrCloseWithoutAnimations(state)) {
                    return;
                }
                this.openOrClose(state);
            });
        }, {});
    }

    /** @ignore */
    private onCssAnimationStatusChangeChangeEffect() {
        let isFirst = true;
        effect(() => {
            const cssAnimationStatus = this.cssAnimationStatus();
            untracked(() => {
                if (isFirst) {
                    isFirst = false;
                    return;
                }
                if (!this.ifOpenOrCloseWithAnimations(cssAnimationStatus)) {
                    return;
                }
                this.openOrClose(this.state());
            });
        });
    }

    /** @ignore */
    private emitOpenOrClosedEventEffect() {
        let isFirst = true;
        effect(() => {
            this.attachDetachEvent();
            this.cssAnimationStatus();
            untracked(() => {
                if (isFirst) {
                    isFirst = false;
                    return;
                }
                const canEmitOpenClose = untracked(() => this.canEmitOnOpenOrOnClosed());
                if (!canEmitOpenClose) {
                    return;
                }
                this.emitOnOpenOrOnClosed(this.state());
            });
        });
    }

    /** @ignore */
    private onOpenChangeEffect() {
        effect(() => {
            const open = this.open();
            untracked(() => {
                this.setState(open ? RdxTooltipState.OPEN : RdxTooltipState.CLOSED);
            });
        });
    }

    /** @ignore */
    private onIsFirstDefaultOpenChangeEffect() {
        const effectRef = effect(() => {
            const defaultOpen = this.defaultOpen();
            untracked(() => {
                if (!defaultOpen || this.open()) {
                    effectRef.destroy();
                    return;
                }
                this.handleOpen();
            });
        });
    }

    /** @ignore */
    private onAnchorChangeEffect = () => {
        effect(() => {
            const anchor = this.anchor();
            untracked(() => {
                if (anchor) {
                    anchor.setRoot(this);
                }
            });
        });
    };

    /** @ignore */
    private actionSubscription() {
        this.actionSubject$
            .asObservable()
            .pipe(
                map((action) => {
                    switch (action) {
                        case RdxTooltipAction.OPEN:
                            return { action, duration: this.openDelay() };
                        case RdxTooltipAction.CLOSE:
                            return { action, duration: this.closeDelay() };
                    }
                }),
                debounce((config) => timer(config.duration)),
                tap((config) => {
                    switch (config.action) {
                        case RdxTooltipAction.OPEN:
                            this.setState(RdxTooltipState.OPEN);
                            break;
                        case RdxTooltipAction.CLOSE:
                            this.setState(RdxTooltipState.CLOSED);
                            break;
                    }
                }),
                takeUntilDestroyed()
            )
            .subscribe();
    }
}
