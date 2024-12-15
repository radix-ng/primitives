import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    effect,
    forwardRef,
    inject,
    input,
    signal,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { RdxPopoverArrowToken } from './popover-arrow.token';
import { RdxPopoverContentAttributesToken } from './popover-content-attributes.token';
import { RdxPopoverContentDirective } from './popover-content.directive';
import { RdxPopoverRootToken } from './popover-root.token';
import { RdxPopoverTriggerDirective } from './popover-trigger.directive';
import { RdxPopoverAnimationStatus, RdxPopoverAttachDetachEvent, RdxPopoverState } from './popover.types';
import { isRdxPopoverDevMode } from './popover.utils';

let nextId = 0;

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
export class RdxPopoverRootDirective {
    /** @ignore */
    readonly uniqueId = signal(++nextId);
    /** @ignore */
    readonly name = computed(() => `rdx-popover-root-${this.uniqueId()}`);

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
     * @description Whether to take into account CSS open/close animations.
     * @default false
     */
    readonly cssAnimation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    /**
     * @description Whether to take into account CSS open animations. `cssAnimation` input must be set to 'true'
     * @default false
     */
    readonly cssOpenAnimation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    /**
     * @description Whether to take into account CSS close animations. `cssAnimation` input must be set to 'true'
     * @default false
     */
    readonly cssCloseAnimation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @ignore */
    readonly cssAnimationStatus = signal<RdxPopoverAnimationStatus | null>(null);

    /** @ignore */
    readonly popoverContentDirective = contentChild.required(RdxPopoverContentDirective);
    /** @ignore */
    readonly popoverTriggerDirective = contentChild.required(RdxPopoverTriggerDirective);
    /** @ignore */
    readonly popoverArrowDirective = contentChild(RdxPopoverArrowToken);
    /** @ignore */
    readonly popoverContentAttributesDirective = contentChild(RdxPopoverContentAttributesToken);

    /** @ignore */
    readonly viewContainerRef = inject(ViewContainerRef);
    /** @ignore */
    private readonly document = inject(DOCUMENT);
    /** @ignore */
    readonly destroyRef = inject(DestroyRef);

    /** @ignore */
    readonly state = signal(RdxPopoverState.CLOSED);

    /** @ignore */
    readonly attachDetachEvent = signal(RdxPopoverAttachDetachEvent.DETACH);

    /** @ignore */
    private isFirstDefaultOpen = signal(false);

    constructor() {
        this.onStateChangeEffect();
        this.onCssAnimationStatusChangeChangeEffect();
        this.onOpenChangeEffect();
        this.onIsFirstDefaultOpenChangeEffect();
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
            cssOpenAnimation: this.cssOpenAnimation(),
            cssCloseAnimation: this.cssCloseAnimation(),
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
        isRdxPopoverDevMode() && console.log(this.uniqueId(), '[setState]', state, this.getAnimationParamsSnapshot());
        this.state.set(state);
    }

    /** @ignore */
    private openContent(): void {
        this.popoverContentDirective().open();
        if (!this.cssAnimation() || !this.cssOpenAnimation()) {
            this.cssAnimationStatus.set(null);
        }
    }

    /** @ignore */
    private closeContent(): void {
        this.popoverContentDirective().close();
        if (!this.cssAnimation() || !this.cssCloseAnimation()) {
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
            !this.popoverContentAttributesDirective() ||
            !this.cssAnimation() ||
            (this.cssAnimation() && !this.cssCloseAnimation() && state === RdxPopoverState.CLOSED) ||
            (this.cssAnimation() && !this.cssOpenAnimation() && state === RdxPopoverState.OPEN) ||
            // !this.cssAnimationStatus() ||
            (this.cssOpenAnimation() &&
                state === RdxPopoverState.OPEN &&
                [RdxPopoverAnimationStatus.OPEN_STARTED].includes(this.cssAnimationStatus()!)) ||
            (this.cssCloseAnimation() &&
                state === RdxPopoverState.CLOSED &&
                [RdxPopoverAnimationStatus.CLOSED_STARTED].includes(this.cssAnimationStatus()!))
        );
    }

    /** @ignore */
    private ifOpenOrCloseWithAnimations(cssAnimationStatus: RdxPopoverAnimationStatus | null) {
        return (
            this.popoverContentAttributesDirective() &&
            this.cssAnimation() &&
            cssAnimationStatus &&
            ((this.cssOpenAnimation() &&
                this.state() === RdxPopoverState.OPEN &&
                [RdxPopoverAnimationStatus.OPEN_ENDED].includes(cssAnimationStatus)) ||
                (this.cssCloseAnimation() &&
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
            (!this.cssOpenAnimation() && this.state() === RdxPopoverState.OPEN) ||
            (this.cssOpenAnimation() &&
                this.state() === RdxPopoverState.OPEN &&
                this.cssAnimationStatus() === RdxPopoverAnimationStatus.OPEN_ENDED) ||
            (!this.cssCloseAnimation() && this.state() === RdxPopoverState.CLOSED) ||
            (this.cssCloseAnimation() &&
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
                isRdxPopoverDevMode() &&
                    console.log(this.uniqueId(), '[onStateChangeEffect]', state, this.getAnimationParamsSnapshot());
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
                isRdxPopoverDevMode() &&
                    console.log(
                        this.uniqueId(),
                        '[onCssAnimationStatusChangeChangeEffect]',
                        cssAnimationStatus,
                        this.state(),
                        this.getAnimationParamsSnapshot()
                    );
                this.openOrClose(this.state());
            });
        });
    }

    /** @ignore */
    private emitOpenOrClosedEventEffect() {
        let isFirst = true;
        effect(() => {
            const listenedConditions = {
                attachDetachEvent: this.attachDetachEvent(),
                cssAnimationStatus: this.cssAnimationStatus()
            };
            if (isFirst) {
                isFirst = false;
                return;
            }
            untracked(() => {
                const canEmitOpenClose = untracked(() => this.canEmitOnOpenOrOnClosed());
                if (!canEmitOpenClose) {
                    return;
                }
                isRdxPopoverDevMode() &&
                    console.log(
                        this.uniqueId(),
                        '[emitOpenOrClosedEventEffect]',
                        canEmitOpenClose,
                        listenedConditions,
                        this.getAnimationParamsSnapshot()
                    );
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
                isRdxPopoverDevMode() &&
                    console.log(
                        this.uniqueId(),
                        '[onIsFirstDefaultOpenChangeEffect]',
                        defaultOpen,
                        this.getAnimationParamsSnapshot()
                    );
                this.handleOpen();
            });
        });
    }
}
