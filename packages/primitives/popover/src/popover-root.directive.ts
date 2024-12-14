import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    effect,
    forwardRef,
    inject,
    input,
    OnInit,
    output,
    signal,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { RdxPopoverArrowToken } from './popover-arrow.token';
import { RdxPopoverContentAttributesToken } from './popover-content-attributes.token';
import { RdxPopoverContentDirective } from './popover-content.directive';
import { RdxPopoverRootToken } from './popover-root.token';
import { RdxPopoverTriggerDirective } from './popover-trigger.directive';
import { RdxPopoverAnimationStatus, RdxPopoverState } from './popover.types';
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
export class RdxPopoverRootDirective implements OnInit {
    /** @ignore */
    readonly uniqueId = signal(++nextId);
    /** @ignore */
    readonly name = computed(() => `rdx-popover-root-${this.uniqueId()}`);

    /**
     * The open state of the popover when it is initially rendered. Use when you do not need to control its open state.
     */
    readonly defaultOpen = input<boolean>(false);
    /**
     * The controlled open state of the popover. Must be used in conjunction with onOpenChange.
     */
    readonly open = input<boolean | undefined>();
    /** @ignore */
    /**
     * TODO: create a dedicated transformer
     */
    readonly cssAnimation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    /** @ignore */
    readonly cssOnShowAnimation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    /** @ignore */
    readonly cssOnCloseAnimation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Event handler called when the open state of the popover changes.
     */
    readonly onOpenChange = output<boolean>();

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
    private isControlledExternally = computed(() => signal(this.open() !== void 0));

    constructor() {
        this.onStateChangeEffect();
        this.onCssAnimationStatusChangeChangeEffect();
        this.onOpenChangeEffect();
    }

    /** @ignore */
    ngOnInit(): void {
        if (this.defaultOpen()) {
            this.handleOpen();
        }
    }

    /** @ignore */
    controlledExternally() {
        return this.isControlledExternally().asReadonly();
    }

    /** @ignore */
    handleOpen(): void {
        if (this.isControlledExternally()()) {
            return;
        }
        this.setState(RdxPopoverState.OPEN);
    }

    /** @ignore */
    handleClose(): void {
        if (this.isControlledExternally()()) {
            return;
        }
        this.setState(RdxPopoverState.CLOSED);
    }

    /** @ignore */
    handleToggle(): void {
        if (this.isControlledExternally()()) {
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
        isRdxPopoverDevMode() && console.log(this.uniqueId(), 'setState', state);
        this.state.set(state);
    }

    /** @ignore */
    private show(): void {
        this.popoverContentDirective().show();
    }

    /** @ignore */
    private hide(): void {
        this.popoverContentDirective().hide();
    }

    /** @ignore */
    private getAnimationParamsSnapshot() {
        return {
            cssAnimation: this.cssAnimation(),
            cssOnShowAnimation: this.cssOnShowAnimation(),
            cssOnCloseAnimation: this.cssOnCloseAnimation(),
            cssAnimationStatus: this.cssAnimationStatus(),
            state: this.state()
        };
    }

    /** @ignore */
    private onStateChangeEffect() {
        effect(() => {
            const state = this.state();

            untracked(() => {
                isRdxPopoverDevMode() &&
                    console.log(
                        this.uniqueId(),
                        '[onStateChangeEffect] pre filter',
                        state,
                        this.getAnimationParamsSnapshot()
                    );
                if (!this.ifRunOnStateChangeCallbackSync(state)) {
                    return;
                }
                isRdxPopoverDevMode() && console.log(this.uniqueId(), '[onStateChangeEffect]', state);
                this.onStateChangeCallback(state);
            });
        });
    }

    /** @ignore */
    private onCssAnimationStatusChangeChangeEffect() {
        effect(() => {
            const cssAnimationStatus = this.cssAnimationStatus();

            untracked(() => {
                isRdxPopoverDevMode() &&
                    console.log(
                        this.uniqueId(),
                        '[onCssAnimationStatusChangeChangeEffect pre filter]',
                        cssAnimationStatus,
                        this.getAnimationParamsSnapshot()
                    );

                if (!this.ifRunOnStateChangeCallbackAsync(cssAnimationStatus)) {
                    return;
                }

                isRdxPopoverDevMode() &&
                    console.log(
                        this.uniqueId(),
                        '[onCssAnimationStatusChangeChangeEffect]',
                        cssAnimationStatus,
                        this.state()
                    );
                this.onStateChangeCallback(this.state());
            });
        });
    }

    /** @ignore */
    private ifRunOnStateChangeCallbackSync(state: RdxPopoverState) {
        return (
            !this.popoverContentAttributesDirective() ||
            !this.cssAnimation() ||
            !this.cssOnCloseAnimation() ||
            state === RdxPopoverState.OPEN
        );
    }

    /** @ignore */
    private ifRunOnStateChangeCallbackAsync(cssAnimationStatus: RdxPopoverAnimationStatus | null) {
        return (
            this.popoverContentAttributesDirective() &&
            this.cssAnimation() &&
            this.cssOnCloseAnimation() &&
            cssAnimationStatus &&
            this.state() === RdxPopoverState.CLOSED &&
            [RdxPopoverAnimationStatus.CLOSED_ENDED].includes(cssAnimationStatus)
        );
    }

    /** @ignore */
    private onStateChangeCallback(state: RdxPopoverState) {
        const isOpen = this.isOpen(state);
        isOpen ? this.show() : this.hide();
        this.onOpenChange.emit(isOpen);
    }

    /** @ignore */
    private onOpenChangeEffect() {
        effect(() => {
            const currentOpen = this.open();

            untracked(() => {
                this.isControlledExternally().set(currentOpen !== void 0);
                if (this.isControlledExternally()()) {
                    this.setState(currentOpen ? RdxPopoverState.OPEN : RdxPopoverState.CLOSED);
                }
            });
        });
    }
}
