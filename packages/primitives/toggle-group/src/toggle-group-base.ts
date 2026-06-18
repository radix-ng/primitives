import { booleanAttribute, computed, Directive, effect, input, model, output, signal, untracked } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    DataOrientation,
    RdxCancelableChangeEventDetails
} from '@radix-ng/primitives/core';
import { RdxToggleGroupContext } from './toggle-group-context';

export type RdxToggleGroupValueChangeReason = 'none';
export type RdxToggleGroupValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxToggleGroupValueChangeReason>;

export interface RdxToggleGroupValueChangeEvent {
    value: string[];
    eventDetails: RdxToggleGroupValueChangeEventDetails;
}

/** Builds the shared context a {@link RdxToggle} reads when it belongs to this group. */
export function toggleGroupContext(instance: RdxToggleGroupBase): RdxToggleGroupContext {
    return {
        value: instance.pressedValues,
        disabled: instance.isDisabled,
        orientation: instance.orientation,
        isValueInitialized: instance.isValueInitialized,
        toggle: (value, event, eventDetails) => instance.toggle(value, event, eventDetails)
    };
}

/**
 * Shared state and behavior for the toggle group. Concrete directives add the composite root
 * ({@link RdxToggleGroup}) or omit it when an ancestor already owns focus, e.g. a toolbar
 * ({@link RdxToggleGroupWithoutFocus}).
 */
@Directive({
    host: {
        role: 'group',
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-multiple]': 'multiple() ? "" : undefined',
        '(focusout)': 'onTouched?.()'
    }
})
export abstract class RdxToggleGroupBase implements ControlValueAccessor {
    /**
     * The pressed values. Always an array — a single value is `[value]`. Use with `(onValueChange)`
     * for controlled state.
     */
    readonly value = model<string[]>();

    /** The values pressed when the group is initially rendered (uncontrolled). */
    readonly defaultValue = input<string[]>();

    /**
     * Whether multiple items can be pressed at the same time.
     *
     * @default false
     */
    readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the whole group is disabled.
     *
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The orientation of the group, controlling arrow-key navigation.
     *
     * @default 'horizontal'
     */
    readonly orientation = input<DataOrientation>('horizontal');

    /** Event emitted when the pressed values change. */
    readonly onValueChange = output<RdxToggleGroupValueChangeEvent>();

    /** @ignore */
    readonly pressedValues = computed(() => this.value() ?? []);
    /** @ignore */
    readonly isValueInitialized = computed(() => this.value() !== undefined || this.defaultValue() !== undefined);

    protected readonly accessorDisabled = signal(false);
    /** @ignore */
    readonly isDisabled = computed(() => this.disabled() || this.accessorDisabled() || this.isExternallyDisabled());

    private onChange?: (value: string[]) => void;
    protected onTouched?: () => void;

    constructor() {
        effect(() => {
            const initial = this.defaultValue();
            if (initial !== undefined && untracked(this.value) === undefined) {
                this.value.set(initial);
            }
        });
    }

    /** @ignore Extra disabled state inherited from composite parents such as Toolbar. */
    protected isExternallyDisabled(): boolean {
        return false;
    }

    /** @ignore */
    toggle(value: string, event?: Event, eventDetails?: RdxToggleGroupValueChangeEventDetails): void {
        if (this.isDisabled()) {
            return;
        }

        const current = this.pressedValues();
        let next: string[];

        if (this.multiple()) {
            next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
        } else {
            next = current.includes(value) ? [] : [value];
        }

        const resolvedEventDetails =
            eventDetails ??
            createCancelableChangeEventDetails(
                'none',
                event ?? new Event('toggle-group.value-change'),
                event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined
            ).eventDetails;

        this.onValueChange.emit({ value: next, eventDetails: resolvedEventDetails });
        if (resolvedEventDetails.isCanceled()) {
            return;
        }

        this.value.set(next);
        this.onChange?.(next);
    }

    /** @ignore */
    writeValue(value: string[] | string | null): void {
        this.value.set(value == null ? [] : Array.isArray(value) ? value : [value]);
    }

    /** @ignore */
    registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }

    /** @ignore */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** @ignore */
    setDisabledState(isDisabled: boolean): void {
        this.accessorDisabled.set(isDisabled);
    }
}
