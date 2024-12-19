import { BooleanInput } from '@angular/cdk/coercion';
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
    signal,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { RdxPopoverAnchorDirective } from './popover-anchor.directive';
import { RdxPopoverAnchorToken } from './popover-anchor.token';
import { RdxPopoverArrowToken } from './popover-arrow.token';
import { RdxPopoverCloseToken } from './popover-close.token';
import { RdxPopoverContentAttributesToken } from './popover-content-attributes.token';
import { RdxPopoverContentDirective } from './popover-content.directive';
import { RdxPopoverTriggerDirective } from './popover-trigger.directive';
import { RdxPopoverAnimationStatus, RdxPopoverAttachDetachEvent, RdxPopoverState } from './popover.types';

let nextId = 0;

@Directive({
    selector: '[rdxPopoverRoot]',
    standalone: true,
    exportAs: 'rdxPopoverRoot'
})
export class RdxPopoverRootDirective {
    /** @ignore */
    readonly uniqueId = signal(++nextId);
    /** @ignore */
    readonly name = computed(() => `rdx-popover-root-${this.uniqueId()}`);

    /**
     * @description The anchor directive that comes form outside the popover root
     * @default undefined
     */
    readonly anchor = input<RdxPopoverAnchorDirective | undefined>(void 0);
    /**
     * @description The open state of the popover when it is initially rendered. Use when you do not need to control its open state.
     * @default false
     */
    readonly defaultOpen = input<boolean>(false);
    /**
     * @description The controlled state of the popover. `open` input take precedence of `defaultOpen` input.
     * @default undefined
     */
    readonly open = input<boolean | undefined>(void 0);
    /**
     * @description Whether to control the state of the popover from external. Use in conjunction with `open` input.
     * @default undefined
     */
    readonly externalControl = input<boolean | undefined>(void 0);
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
    readonly cssAnimationStatus = signal<RdxPopoverAnimationStatus | null>(null);

    /** @ignore */
    readonly popoverContentDirective = contentChild.required(RdxPopoverContentDirective);
    /** @ignore */
    readonly popoverTriggerDirective = contentChild.required(RdxPopoverTriggerDirective);
    /** @ignore */
    readonly popoverArrowDirective = contentChild(RdxPopoverArrowToken);
    /** @ignore */
    readonly popoverCloseDirective = contentChild(RdxPopoverCloseToken);
    /** @ignore */
    readonly popoverContentAttributesComponent = contentChild(RdxPopoverContentAttributesToken);
    /** @ignore */
    private readonly internalPopoverAnchorDirective = contentChild(RdxPopoverAnchorToken);

    /** @ignore */
    readonly viewContainerRef = inject(ViewContainerRef);
    /** @ignore */
    readonly destroyRef = inject(DestroyRef);

    /** @ignore */
    readonly state = signal(RdxPopoverState.CLOSED);

    /** @ignore */
    readonly attachDetachEvent = signal(RdxPopoverAttachDetachEvent.DETACH);

    /** @ignore */
    private isFirstDefaultOpen = signal(false);

    /** @ignore */
    readonly popoverAnchorDirective = computed(() => this.internalPopoverAnchorDirective() ?? this.anchor());

    constructor() {
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
        this.setState(RdxPopoverState.OPEN);
    }

    /** @ignore */
    handleClose(): void {
        if (this.isFirstDefaultOpen()) {
            this.isFirstDefaultOpen.set(false);
        }
        if (this.externalControl()) {
            return;
        }
        this.setState(RdxPopoverState.CLOSED);
    }

    /** @ignore */
    handleToggle(): void {
        if (this.externalControl()) {
            return;
        }
        this.isOpen() ? this.handleClose() : this.handleOpen();
    }

    /** @ignore */
    isOpen(state?: RdxPopoverState) {
        return (state ?? this.state()) === RdxPopoverState.OPEN;
    }

    /** @ignore */
    private setState(state = RdxPopoverState.CLOSED): void {
        if (state === this.state()) {
            return;
        }
        this.state.set(state);
    }

    /** @ignore */
    private openContent(): void {
        this.popoverContentDirective().open();
        if (!this.cssAnimation() || !this.cssOpeningAnimation()) {
            this.cssAnimationStatus.set(null);
        }
    }

    /** @ignore */
    private closeContent(): void {
        this.popoverContentDirective().close();
        if (!this.cssAnimation() || !this.cssClosingAnimation()) {
            this.cssAnimationStatus.set(null);
        }
    }

    /** @ignore */
    private emitOnOpen(): void {
        this.popoverContentDirective().onOpen.emit();
    }

    /** @ignore */
    private emitOnClosed(): void {
        this.popoverContentDirective().onClosed.emit();
    }

    /** @ignore */
    private ifOpenOrCloseWithoutAnimations(state: RdxPopoverState) {
        return (
            !this.popoverContentAttributesComponent() ||
            !this.cssAnimation() ||
            (this.cssAnimation() && !this.cssClosingAnimation() && state === RdxPopoverState.CLOSED) ||
            (this.cssAnimation() && !this.cssOpeningAnimation() && state === RdxPopoverState.OPEN) ||
            // !this.cssAnimationStatus() ||
            (this.cssOpeningAnimation() &&
                state === RdxPopoverState.OPEN &&
                [RdxPopoverAnimationStatus.OPEN_STARTED].includes(this.cssAnimationStatus()!)) ||
            (this.cssClosingAnimation() &&
                state === RdxPopoverState.CLOSED &&
                [RdxPopoverAnimationStatus.CLOSED_STARTED].includes(this.cssAnimationStatus()!))
        );
    }

    /** @ignore */
    private ifOpenOrCloseWithAnimations(cssAnimationStatus: RdxPopoverAnimationStatus | null) {
        return (
            this.popoverContentAttributesComponent() &&
            this.cssAnimation() &&
            cssAnimationStatus &&
            ((this.cssOpeningAnimation() &&
                this.state() === RdxPopoverState.OPEN &&
                [RdxPopoverAnimationStatus.OPEN_ENDED].includes(cssAnimationStatus)) ||
                (this.cssClosingAnimation() &&
                    this.state() === RdxPopoverState.CLOSED &&
                    [RdxPopoverAnimationStatus.CLOSED_ENDED].includes(cssAnimationStatus)))
        );
    }

    /** @ignore */
    private openOrClose(state: RdxPopoverState) {
        const isOpen = this.isOpen(state);
        isOpen ? this.openContent() : this.closeContent();
    }

    /** @ignore */
    private emitOnOpenOrOnClosed(state: RdxPopoverState) {
        this.isOpen(state)
            ? this.attachDetachEvent() === RdxPopoverAttachDetachEvent.ATTACH && this.emitOnOpen()
            : this.attachDetachEvent() === RdxPopoverAttachDetachEvent.DETACH && this.emitOnClosed();
    }

    /** @ignore */
    private canEmitOnOpenOrOnClosed() {
        return (
            !this.cssAnimation() ||
            (!this.cssOpeningAnimation() && this.state() === RdxPopoverState.OPEN) ||
            (this.cssOpeningAnimation() &&
                this.state() === RdxPopoverState.OPEN &&
                this.cssAnimationStatus() === RdxPopoverAnimationStatus.OPEN_ENDED) ||
            (!this.cssClosingAnimation() && this.state() === RdxPopoverState.CLOSED) ||
            (this.cssClosingAnimation() &&
                this.state() === RdxPopoverState.CLOSED &&
                this.cssAnimationStatus() === RdxPopoverAnimationStatus.CLOSED_ENDED)
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
                this.setState(open ? RdxPopoverState.OPEN : RdxPopoverState.CLOSED);
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
                    anchor.setPopoverRoot(this);
                }
            });
        });
    };
}
