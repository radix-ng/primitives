import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectNumberFieldRootContext } from './number-field-context';
import {
    CHANGE_VALUE_TICK_DELAY,
    createPressAndHold,
    PressAndHold,
    SCROLLING_POINTER_MOVE_DISTANCE,
    START_AUTO_CHANGE_DELAY
} from './number-field.utils';
import { Direction, NumberFieldChangeReason } from './types';

// Treat pen as touch-like to avoid forcing the software keyboard on stylus taps.
function isTouchLikePointerType(pointerType: string): boolean {
    return pointerType === 'touch' || pointerType === 'pen';
}

/**
 * Shared behaviour for the increment and decrement stepper buttons: single-press,
 * press-and-hold auto-repeat, and committing a dirty (typed-but-not-blurred) input
 * value before stepping.
 *
 * @see https://base-ui.com/react/components/number-field
 */
@Directive({
    host: {
        type: 'button',
        tabindex: '-1',
        '[attr.aria-controls]': 'rootContext.id()',
        '[attr.aria-readonly]': 'rootContext.readonly() ? "true" : undefined',
        '[attr.disabled]': 'buttonDisabled() ? "" : undefined',
        '[attr.data-disabled]': 'buttonDisabled() ? "" : undefined',
        '[attr.data-pressed]': 'press.isPressing() ? "" : undefined',
        '[style.user-select]': '"none"',
        '[style.-webkit-user-select]': '"none"',
        '(click)': 'onClick($event)',
        '(pointerdown)': 'onPointerDown($event)',
        '(contextmenu)': '$event.preventDefault()'
    }
})
export abstract class RdxNumberFieldButton {
    protected readonly rootContext = injectNumberFieldRootContext()!;

    /** Whether this is the increment (`+1`) button; `false` for decrement (`-1`). */
    protected abstract readonly isIncrement: boolean;

    /**
     * When `true`, the button is disabled in addition to inheriting the root's disabled state.
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @ignore Disabled for display/focus purposes (own state, root disabled, or bound reached). */
    readonly buttonDisabled = computed(
        () =>
            this.disabled() ||
            this.rootContext.isDisabled() ||
            (this.isIncrement ? this.rootContext.isIncrementDisabled() : this.rootContext.isDecrementDisabled())
    );

    /** @ignore Disabled for interaction purposes (also blocked while read-only). */
    private readonly interactionDisabled = computed(() => this.buttonDisabled() || this.rootContext.readonly());

    private get direction(): Direction {
        return this.isIncrement ? 1 : -1;
    }

    private get pressReason(): NumberFieldChangeReason {
        return this.isIncrement ? 'increment-press' : 'decrement-press';
    }

    /** @ignore */
    readonly press: PressAndHold;

    constructor() {
        const root = this.rootContext;
        this.press = createPressAndHold({
            disabled: () => this.interactionDisabled(),
            startDelay: START_AUTO_CHANGE_DELAY,
            tickDelay: CHANGE_VALUE_TICK_DELAY,
            scrollDistance: SCROLLING_POINTER_MOVE_DISTANCE,
            tick: (event) => {
                const amount = root.getStepAmount(event);
                return root.incrementValue(amount, {
                    direction: this.direction,
                    event,
                    reason: this.pressReason
                });
            },
            onStop: () => root.commitValue(root.lastChangedValue ?? root.currentValue())
        });
    }

    onClick(event: MouseEvent): void {
        if (event.defaultPrevented || this.interactionDisabled() || this.press.shouldSkipClick()) {
            return;
        }

        this.commitDirtyValue(event);

        const amount = this.rootContext.getStepAmount(event);
        const prev = this.rootContext.currentValue();
        this.rootContext.incrementValue(amount, {
            direction: this.direction,
            event,
            reason: this.pressReason
        });

        const committed = this.rootContext.lastChangedValue ?? this.rootContext.currentValue();
        if (committed !== prev) {
            this.rootContext.commitValue(committed);
        }
    }

    onPointerDown(event: PointerEvent): void {
        const isMainButton = !event.button || event.button === 0;
        if (event.defaultPrevented || this.rootContext.readonly() || !isMainButton || this.buttonDisabled()) {
            return;
        }

        // Sync the dirty input value before starting the hold sequence.
        this.commitDirtyValue(event);

        if (!isTouchLikePointerType(event.pointerType)) {
            // Focus the input so the user can continue with the keyboard.
            this.rootContext.inputEl()?.focus();
        }

        this.press.onPointerDown(event);
    }

    /** Commits a typed-but-not-yet-blurred input value so stepping starts from it. */
    private commitDirtyValue(event: Event): void {
        const root = this.rootContext;
        root.allowInputSync = true;
        const parsed = root.parseNumber(root.inputValue());
        if (parsed !== null) {
            root.setValue(parsed, this.pressReason, event, this.direction);
        }
    }
}
