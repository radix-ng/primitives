import { _IdGenerator } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    inject,
    input,
    model,
    numberAttribute,
    signal
} from '@angular/core';
import { createContext, watch } from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { RdxTooltipTrigger } from './tooltip-trigger';
import { injectRdxTooltipConfig } from './tooltip.config';
import { useTimeoutFn } from './utils';

const context = () => {
    const context = inject(RdxTooltip);

    return {
        isOpen: context.open,
        state: context.state,
        contentId: inject(_IdGenerator).getId('rdx-tooltip-content-'),
        trigger: context.trigger,
        isDisabled: context.disabled,
        ignoreNonKeyboardFocus: context.ignoreNonKeyboardFocus,
        disableClosingTrigger: context.disableClosingTrigger,
        disableHoverableContent: context.disableHoverableContent,
        isPointerInTransit: context.isPointerInTransit.asReadonly(),
        isControlledState: context.isControlledState,
        open() {
            context.handleOpen();
        },
        close() {
            context.handleClose();
        },
        onTriggerEnter() {
            if (context.isOpenDelayed()) {
                context.handleDelayedOpen();
            } else {
                context.handleOpen();
            }
        },
        onTriggerLeave() {
            if (context.disableHoverableContent()) {
                context.handleClose();
            } else {
                // Clear the timer in case the pointer leaves the trigger before the tooltip is opened.
                context.clearTimer();
            }
        }
    };
};

export type RdxTooltipContext = ReturnType<typeof context>;

export const [injectRdxTooltipContext, provideRdxTooltipContext] =
    createContext<RdxTooltipContext>('RdxTooltipContext');

@Directive({
    selector: '[rdxTooltip]',
    providers: [provideRdxTooltipContext(context)],
    hostDirectives: [RdxPopper]
})
export class RdxTooltip {
    private readonly defaultConfig = injectRdxTooltipConfig();
    private readonly destroyRef = inject(DestroyRef);

    /**
     * Whether the tooltip is currently open.
     */
    readonly open = model(false);

    /**
     * The duration from when the pointer enters the trigger until the tooltip gets opened.
     */
    readonly delayDuration = input(this.defaultConfig.delayDuration, {
        transform: numberAttribute
    });

    /**
     * How much time a user has to enter another trigger without incurring a delay again.
     * @defaultValue 300
     */
    readonly skipDelayDuration = input(this.defaultConfig.skipDelayDuration, { transform: numberAttribute });

    /**
     * When `true`, trying to hover the content will result in the tooltip closing as the pointer leaves the trigger.
     */
    readonly disableHoverableContent = input(this.defaultConfig.disableHoverableContent, {
        transform: booleanAttribute
    });

    /**
     * When `true`, disable tooltip
     * @defaultValue false
     */
    readonly disabled = input(false, { transform: booleanAttribute });

    /**
     * How long to wait before closing the tooltip. Specified in milliseconds.
     */
    readonly closeDelay = input(this.defaultConfig.closeDelay, { transform: numberAttribute });

    /**
     * When `true`, clicking on trigger will not close the content.
     * @defaultValue false
     */
    readonly disableClosingTrigger = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Prevent the tooltip from opening if the focus did not come from
     * the keyboard by matching against the `:focus-visible` selector.
     * This is useful if you want to avoid opening it when switching
     * browser tabs or closing a dialog.
     * @defaultValue false
     */
    readonly ignoreNonKeyboardFocus = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * To render a controlled tooltip
     */
    readonly isControlledState = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly isPointerInTransit = signal(false);
    readonly isOpenDelayed = signal(true);

    private readonly wasOpenDelayed = signal(false);

    readonly state = computed(() => {
        if (!this.open()) {
            return 'closed';
        }

        return this.wasOpenDelayed() ? 'delayed-open' : 'instant-open';
    });

    readonly trigger = contentChild.required(RdxTooltipTrigger);

    readonly timerProvider = useTimeoutFn(
        () => {
            this.isOpenDelayed.set(true);
        },
        () => this.skipDelayDuration()!,
        { immediate: false },
        this.destroyRef
    );

    private readonly timer = useTimeoutFn(
        () => {
            this.wasOpenDelayed.set(true);
            this.open.set(true);
        },
        () => this.delayDuration()!,
        { immediate: false },
        this.destroyRef
    );

    readonly startTimer = () => this.timer.start();
    readonly clearTimer = () => this.timer.stop();

    constructor() {
        watch([this.open], ([isOpen]) => {
            if (isOpen) {
                this.timerProvider.stop();
                this.isOpenDelayed.set(false);
            } else {
                this.timerProvider.start();
            }
        });
    }

    handleOpen() {
        this.clearTimer();
        this.wasOpenDelayed.set(false);
        this.open.set(true);
    }

    handleClose() {
        this.clearTimer();

        window.setTimeout(() => {
            this.open.set(false);
        }, this.closeDelay());
    }

    handleDelayedOpen() {
        this.startTimer();
    }
}
