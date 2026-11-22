import { booleanAttribute, computed, Directive, effect, inject, input, output, signal } from '@angular/core';
import { RDX_BUTTON_CONFIG, RdxButtonBehavior } from '@radix-ng/primitives/button';
import { injectRdxCompositeRootContext, RdxCompositeItem } from '@radix-ng/primitives/composite';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    RdxCancelableChangeEventDetails,
    rdxDevWarning,
    watch
} from '@radix-ng/primitives/core';
import { injectToggleGroupContext } from '@radix-ng/primitives/toggle-group';

export type RdxTogglePressedChangeReason = 'none';
export type RdxTogglePressedChangeEventDetails = RdxCancelableChangeEventDetails<RdxTogglePressedChangeReason>;

export interface RdxTogglePressedChangeEvent {
    pressed: boolean;
    eventDetails: RdxTogglePressedChangeEventDetails;
}

/**
 * A two-state button that can be either on (pressed) or off.
 *
 * Works standalone or as an item of a `[rdxToggleGroup]`: inside a group it derives its pressed
 * state from the group's value (matched by `value`) and participates in the group's composite focus.
 *
 * @see https://base-ui.com/react/components/toggle
 */
@Directive({
    selector: '[rdxToggle]',
    exportAs: 'rdxToggle',
    hostDirectives: [{ directive: RdxCompositeItem, inputs: ['tabIndex'] }],
    providers: [RdxButtonBehavior],
    host: {
        '[attr.type]': 'nativeButton() ? "button" : undefined',
        '[attr.role]': 'nativeButton() ? undefined : "button"',
        '[attr.tabindex]': 'hostTabIndex()',
        '[attr.aria-pressed]': 'pressedState()',
        '[attr.data-pressed]': 'pressedState() ? "" : undefined',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.disabled]': 'nativeButton() && isDisabled() && !isFocusableWhenDisabled() ? "" : undefined',
        '[attr.aria-disabled]': 'ariaDisabled()',
        '(click)': 'onClick($event)'
    }
})
export class RdxToggle {
    private readonly group = injectToggleGroupContext(true);
    private readonly compositeItem = inject(RdxCompositeItem, { self: true });
    private readonly isComposite = !!injectRdxCompositeRootContext(true);
    private readonly buttonBehavior = inject(RdxButtonBehavior, { self: true });
    private readonly buttonConfig = inject(RDX_BUTTON_CONFIG, { self: true, optional: true });

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
     * The parent-owned pressed state (standalone). Use `[(pressed)]` to accept changes immediately.
     */
    readonly pressedInput = input<boolean>(undefined, { alias: 'pressed' });

    /** Emits the requested standalone value after the cancelable change handler accepts it. */
    readonly pressedChange = output<boolean>();

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

    /** Cancelable request emitted before the standalone or group state changes. */
    readonly onPressedChange = output<RdxTogglePressedChangeEvent>();

    private readonly uncontrolledPressed = signal(false);

    /** The effective pressed state. A group owns the state of its items. */
    readonly pressed = computed(() => {
        if (this.group) {
            const value = this.value();
            return value !== undefined && this.group.value().includes(value);
        }
        return this.pressedInput() ?? this.uncontrolledPressed();
    });
    /** @ignore */
    readonly pressedState = this.pressed;

    /** @ignore */
    readonly isDisabled = computed(
        () => this.disabled() || (this.group?.disabled() ?? false) || (this.buttonConfig?.disabled() ?? false)
    );

    /** @ignore Only an owning disabled button can opt a Toggle into focusable disabled semantics. */
    protected readonly isFocusableWhenDisabled = computed(() =>
        this.buttonConfig ? this.buttonConfig.disabled() && this.buttonConfig.focusableWhenDisabled() : false
    );

    /** @ignore The rendered Toggle retains composite aria-disabled even with native disabled. */
    protected readonly ariaDisabled = computed<'true' | undefined>(() =>
        this.isDisabled() && (!this.nativeButton() || this.isComposite || !!this.buttonConfig) ? 'true' : undefined
    );

    /** @ignore */
    protected readonly hostTabIndex = computed(() => {
        if (this.isComposite || this.compositeItem.tabIndexInput() !== undefined) {
            return this.compositeItem.tabIndex();
        }
        return !this.nativeButton() && this.isDisabled() ? -1 : 0;
    });

    constructor() {
        if (this.buttonConfig) {
            this.buttonBehavior.registerRenderedButton(this.ariaDisabled);
        } else {
            this.buttonBehavior.configure(
                {
                    disabled: this.isDisabled,
                    focusableWhenDisabled: this.isFocusableWhenDisabled,
                    native: this.nativeButton,
                    compositeActivation: this.isComposite
                },
                'toggle'
            );
        }
        if (!this.group) watch([], () => this.uncontrolledPressed.set(this.defaultPressed()));
        effect(() => {
            if (this.group && this.value() === undefined && this.group.isValueInitialized()) {
                rdxDevWarning(
                    'toggle-group/missing-toggle-value',
                    '`rdxToggle` is inside a toggle group but has no `value`. Add a stable `value` so the group can derive and update its pressed state.',
                    'components/toggle-group'
                );
            }
        });
        // A Toolbar.Button owns this shared item's metadata, including its focusable policy.
        if (!this.buttonConfig) {
            effect(() => {
                this.compositeItem.setMetadata({
                    disabled: this.isDisabled(),
                    focusableWhenDisabled: false,
                    value: this.value()
                });
            });
        }
    }

    /** @ignore */
    protected onClick(event?: Event): void {
        if (this.isDisabled()) {
            return;
        }

        if (this.group) {
            const value = this.value();
            if (value !== undefined) {
                const next = !this.pressedState();
                const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
                const { eventDetails } = createCancelableChangeEventDetails(
                    'none',
                    event ?? new Event('toggle.pressed-change'),
                    trigger
                );
                this.onPressedChange.emit({ pressed: next, eventDetails });
                if (eventDetails.isCanceled()) {
                    return;
                }

                this.group.toggle(value, next, event, eventDetails);
            }
            return;
        }

        const next = !this.pressed();
        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const { eventDetails } = createCancelableChangeEventDetails(
            'none',
            event ?? new Event('toggle.pressed-change'),
            trigger
        );
        this.onPressedChange.emit({ pressed: next, eventDetails });
        if (eventDetails.isCanceled()) {
            return;
        }

        if (this.pressedInput() === undefined) this.uncontrolledPressed.set(next);
        this.pressedChange.emit(next);
    }
}
