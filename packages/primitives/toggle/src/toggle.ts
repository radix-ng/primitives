import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    linkedSignal,
    model,
    output
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    RdxCancelableChangeEventDetails
} from '@radix-ng/primitives/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { injectToggleGroupContext } from '@radix-ng/primitives/toggle-group';

export type RdxTogglePressedChangeReason = 'trigger-press' | 'none';
export type RdxTogglePressedChangeEventDetails = RdxCancelableChangeEventDetails<RdxTogglePressedChangeReason>;

export interface RdxTogglePressedChangeEvent {
    pressed: boolean;
    eventDetails: RdxTogglePressedChangeEventDetails;
}

/**
 * A two-state button that can be either on (pressed) or off.
 *
 * Works standalone or as an item of a `[rdxToggleGroup]`: inside a group it derives its pressed
 * state from the group's value (matched by `value`) and participates in the group's roving focus.
 *
 * @see https://base-ui.com/react/components/toggle
 */
@Directive({
    selector: '[rdxToggle]',
    exportAs: 'rdxToggle',
    hostDirectives: [RdxRovingFocusItemDirective],
    host: {
        '[attr.type]': 'nativeButton() ? "button" : undefined',
        '[attr.role]': 'nativeButton() ? undefined : "button"',
        '[attr.aria-pressed]': 'pressedState()',
        '[attr.data-pressed]': 'pressedState() ? "" : undefined',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.disabled]': 'nativeButton() && isDisabled() ? "" : undefined',
        '[attr.aria-disabled]': '!nativeButton() && isDisabled() ? "true" : undefined',
        '(click)': 'onClick($event)',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class RdxToggle {
    private readonly group = injectToggleGroupContext(true);
    private readonly rovingItem = inject(RdxRovingFocusItemDirective);

    /**
     * A value identifying this toggle inside a `[rdxToggleGroup]`. Required when used in a group.
     */
    readonly value = input<string>();

    /**
     * The pressed state when initially rendered (uncontrolled, standalone only).
     *
     * @default false
     */
    readonly defaultPressed = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The controlled pressed state (standalone). Use with `(onPressedChange)` or two-way `[(pressed)]`.
     */
    readonly pressed = model<boolean | undefined>(undefined);

    /**
     * Whether the toggle is disabled.
     *
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the host is a native `<button>`. When `false`, the toggle adds `role="button"` and
     * handles Enter/Space itself.
     *
     * @default true
     */
    readonly nativeButton = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** Event emitted when the pressed state changes (standalone). */
    readonly onPressedChange = output<RdxTogglePressedChangeEvent>();

    private readonly internalPressed = linkedSignal(() => this.pressed() ?? this.defaultPressed());

    /** @ignore Whether the toggle is currently pressed (from the group when grouped). */
    readonly pressedState = computed(() => {
        if (this.group) {
            const value = this.value();
            return value !== undefined && this.group.value().includes(value);
        }
        return this.internalPressed();
    });

    /** @ignore */
    readonly isDisabled = computed(() => this.disabled() || (this.group?.disabled() ?? false));

    constructor() {
        effect(() => this.rovingItem.setActive(this.pressedState()));
        effect(() => this.rovingItem.setFocusable(!this.isDisabled()));
    }

    /** @ignore */
    protected onClick(event?: Event): void {
        if (this.isDisabled()) {
            return;
        }

        if (this.group) {
            const value = this.value();
            if (value !== undefined) {
                this.group.toggle(value, event);
            }
            return;
        }

        const next = !this.internalPressed();
        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const { eventDetails } = createCancelableChangeEventDetails(
            event ? 'trigger-press' : 'none',
            event ?? new Event('toggle.pressed-change'),
            trigger
        );
        this.onPressedChange.emit({ pressed: next, eventDetails });
        if (eventDetails.isCanceled()) {
            return;
        }

        this.internalPressed.set(next);
        this.pressed.set(next);
    }

    /** @ignore */
    protected onKeyDown(event: KeyboardEvent): void {
        if (this.nativeButton()) {
            return;
        }
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            this.onClick(event);
        }
    }
}
