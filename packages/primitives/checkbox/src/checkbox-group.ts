import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    model,
    output,
    signal,
    Signal
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    provideFormUiState,
    provideValueAccessor,
    RdxCancelableChangeEventDetails,
    RdxFormUiControlBase,
    RdxFormUiStateHost,
    RdxFormUiTouchTarget,
    RdxFormValueControl,
    serializeNativeFormValue,
    useNativeFormControl
} from '@radix-ng/primitives/core';
import type { CheckedState } from './checkbox-root';

export type RdxCheckboxGroupValueChangeReason = 'none';
export type RdxCheckboxGroupValueChangeEventDetails =
    RdxCancelableChangeEventDetails<RdxCheckboxGroupValueChangeReason>;

export interface RdxCheckboxGroupValueChangeEvent {
    value: string[];
    eventDetails: RdxCheckboxGroupValueChangeEventDetails;
}

export interface RdxCheckboxGroupContext {
    /** The values of the currently checked checkboxes. */
    value: Signal<string[]>;
    /** All checkbox values, used by a `parent` checkbox to check/uncheck every child. */
    allValues: Signal<string[]>;
    /** External owning form id inherited by optional child native inputs. */
    form: Signal<string | undefined>;
    /** Whether the whole group is disabled. */
    disabled: Signal<boolean>;
    /** The derived state of a `parent` checkbox: all / none / some checked. */
    parentState: Signal<CheckedState>;
    /** The space-separated control ids the `parent` checkbox controls (for `aria-controls`). */
    controlledIds: Signal<string | undefined>;
    /** A stable id for a child's control element, derived from the group id and item value. */
    controlId: (value: string) => string;
    /** Toggle a single child by value. */
    toggleValue: (value: string, event?: Event) => void;
    /** Toggle every child on or off (used by a `parent` checkbox). */
    toggleAll: (event?: Event) => void;
    /** Register a child's value and disabled state so the parent can preserve disabled items. */
    registerChild: (value: string, disabled: Signal<boolean>) => () => void;
    /** Register a child's control element id so the parent can reference it via `aria-controls`. */
    registerControl: (value: string, id: string) => () => void;
}

export const [injectCheckboxGroupContext, provideCheckboxGroupContext] = createContext<RdxCheckboxGroupContext>(
    'CheckboxGroupContext',
    'components/checkbox'
);

const groupContext = (): RdxCheckboxGroupContext => {
    const group = inject(RdxCheckboxGroupDirective);
    return {
        value: group.value,
        allValues: group.allValues,
        form: group.form,
        disabled: group.disabledState,
        parentState: group.parentState,
        controlledIds: group.controlledIds,
        controlId: (value) => group.controlId(value),
        toggleValue: (value, event) => group.toggleValue(value, event),
        toggleAll: (event) => group.toggleAll(event),
        registerChild: (value, disabled) => group.registerChild(value, disabled),
        registerControl: (value, id) => group.registerControl(value, id)
    };
};

let nextCheckboxGroupId = 0;

/**
 * Groups a set of checkboxes that share a single array value (the values of the checked boxes).
 *
 * Each child `rdxCheckboxRoot` participates by its `value` (falling back to `name`). A child marked
 * `parent` becomes a "select all" checkbox whose state is derived from `allValues`.
 */
@Directive({
    selector: '[rdxCheckboxGroup]',
    exportAs: 'rdxCheckboxGroup',
    hostDirectives: [RdxFormUiStateHost],
    providers: [
        provideValueAccessor(RdxCheckboxGroupDirective),
        provideCheckboxGroupContext(groupContext),
        provideFormUiState(() => inject(RdxCheckboxGroupDirective).formUi)
    ],
    host: {
        role: 'group',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined'
    }
})
export class RdxCheckboxGroupDirective
    extends RdxFormUiControlBase
    implements ControlValueAccessor, RdxFormValueControl<string[]>
{
    /** The values of the currently checked checkboxes. Use with `onValueChange` or `[(value)]`. */
    readonly value = model<string[]>([]);

    /** The values checked initially when the group is uncontrolled. */
    readonly defaultValue = input<string[]>();

    /** All checkbox values in the group. Required for a `parent` (select-all) checkbox. */
    readonly allValues = input<string[]>([]);

    /** Native form field name. Selected values are submitted as repeated entries under this name. */
    readonly name = input<string>();

    /** Associates the group with an external form by id. */
    readonly form = input<string>();

    /** Whether the whole group is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Emits the new array of checked values whenever the value changes. */
    readonly onValueChange = output<RdxCheckboxGroupValueChangeEvent>();

    private readonly disabledByCva = signal(false);
    readonly disabledState = computed(() => this.disabledByCva() || this.disabled());

    /** Derived state for a `parent` checkbox: `true` (all), `false` (none) or `'indeterminate'`. */
    readonly parentState = computed<CheckedState>(() => {
        const total = this.allValues().length;
        const count = this.value().length;
        if (total > 0 && count === total) {
            return true;
        }
        return count > 0 ? 'indeterminate' : false;
    });

    /**
     * The value as last set directly by a child (or the initial value) — the "remembered" partial
     * selection that a `parent` checkbox cycles back to, mirroring Base UI's `uncontrolledStateRef`.
     */
    private uncontrolledState: string[] = [];
    private seeded = false;
    /** Where the parent is in its mixed → on → off cycle. Reset to `mixed` on any direct child change. */
    private parentStatus: 'on' | 'off' | 'mixed' = 'mixed';
    /** Per-value disabled signals, so the parent can preserve disabled-but-checked children. */
    private readonly disabledByValue = new Map<string, Signal<boolean>>();

    /** Stable group id used to derive child control ids when the consumer sets none. */
    private readonly elementId = `rdx-checkbox-group-${nextCheckboxGroupId++}`;
    /** Registered control element ids, keyed by child value. */
    private readonly controlIds = signal<Record<string, string>>({});

    /** The space-separated control ids in `allValues` order, for the parent's `aria-controls`. */
    readonly controlledIds = computed<string | undefined>(() => {
        const ids = this.controlIds();
        const list = this.allValues()
            .map((value) => ids[value])
            .filter((id): id is string => id !== undefined);
        return list.length > 0 ? list.join(' ') : undefined;
    });

    private hasAppliedDefault = false;
    private onChange: (value: string[]) => void = () => {
        /* Empty */
    };
    onTouched: () => void = () => {
        /* Empty */
    };

    constructor() {
        super();

        useNativeFormControl({
            name: this.name,
            form: this.form,
            disabled: this.disabledState,
            value: this.value,
            serialize: serializeNativeFormValue,
            defaultValue: () => [...(this.defaultValue() ?? this.value())],
            onReset: (value) => {
                const next = [...value];
                this.value.set(next);
                if (!this.resetNgControl(next)) {
                    this.onChange(next);
                }
                this.seeded = false;
                this.uncontrolledState = next;
                this.parentStatus = 'mixed';
                this.formUi.resetInteractionState?.();
            }
        });

        effect(() => {
            const defaultValue = this.defaultValue();
            if (!this.hasAppliedDefault && defaultValue !== undefined) {
                this.hasAppliedDefault = true;
                this.value.set(defaultValue);
            }
        });
    }

    /** @ignore Bridge the CVA `onTouched` so `markAsTouched()` also notifies Reactive/template forms. */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return { markAsTouched: () => this.onTouched() };
    }

    /** @ignore Register a child's disabled signal keyed by its value. */
    registerChild(value: string, disabled: Signal<boolean>): () => void {
        this.disabledByValue.set(value, disabled);
        return () => {
            if (this.disabledByValue.get(value) === disabled) {
                this.disabledByValue.delete(value);
            }
        };
    }

    /** A stable control id for a child, derived from the group id and item value. */
    controlId(value: string): string {
        return `${this.elementId}-${value}`;
    }

    /** @ignore Register a child's control element id so the parent can list it in `aria-controls`. */
    registerControl(value: string, id: string): () => void {
        this.controlIds.update((ids) => ({ ...ids, [value]: id }));
        return () => {
            this.controlIds.update((ids) => {
                if (ids[value] !== id) {
                    return ids;
                }
                const next = { ...ids };
                delete next[value];
                return next;
            });
        };
    }

    /** Add/remove a single child value from the group value (a direct child change). */
    toggleValue(value: string, event?: Event): void {
        if (this.disabledState()) {
            return;
        }

        const current = this.value();
        const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
        if (!this.emit(next, event)) {
            return;
        }

        // A direct child change becomes the new "remembered" selection and resets the parent cycle.
        this.seeded = true;
        this.uncontrolledState = next;
        this.parentStatus = 'mixed';
    }

    /**
     * Toggle from the `parent` checkbox. Mirrors Base UI's `useCheckboxGroupParent`:
     *
     * - When the remembered selection is all/none, this is a plain check-all ↔ uncheck-all toggle.
     * - When it is a partial selection, clicks cycle: partial → all → none → partial → …, so the
     *   user's original partial choice is restored rather than lost.
     *
     * Disabled-but-checked children are always preserved (they cannot be toggled programmatically).
     */
    toggleAll(event?: Event): void {
        if (this.disabledState()) {
            return;
        }

        this.ensureSeeded();

        const allValues = this.allValues();
        const remembered = this.uncontrolledState;

        // Disabled children that were checked stay checked through every transition.
        const none = allValues.filter((value) => this.isValueDisabled(value) && remembered.includes(value));
        const all = allValues.filter((value) => !this.isValueDisabled(value) || remembered.includes(value));

        const rememberedIsAllOrNone = remembered.length === all.length || remembered.length === 0;
        if (rememberedIsAllOrNone) {
            this.emit(this.value().length === all.length ? none : all, event);
            return;
        }

        let nextStatus: 'on' | 'off' | 'mixed' = 'mixed';
        let nextValue = remembered;
        if (this.parentStatus === 'mixed') {
            nextStatus = 'on';
            nextValue = all;
        } else if (this.parentStatus === 'on') {
            nextStatus = 'off';
            nextValue = none;
        }

        if (!this.emit(nextValue, event)) {
            return;
        }
        this.parentStatus = nextStatus;
    }

    private isValueDisabled(value: string): boolean {
        return this.disabledByValue.get(value)?.() ?? false;
    }

    /** Seed the remembered selection from the current value the first time the parent is used. */
    private ensureSeeded(): void {
        if (!this.seeded) {
            this.seeded = true;
            this.uncontrolledState = this.value();
        }
    }

    private emit(next: string[], event?: Event): boolean {
        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const { eventDetails } = createCancelableChangeEventDetails(
            'none',
            event ?? new Event('checkbox-group.value-change'),
            trigger
        );
        this.onValueChange.emit({ value: next, eventDetails });
        if (eventDetails.isCanceled()) {
            return false;
        }

        this.value.set(next);
        this.formUi.markDirty();
        this.onChange(next);
        this.onTouched();
        return true;
    }

    /** @ignore */
    writeValue(value: string[] | null): void {
        this.value.set(value ?? []);
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
        this.disabledByCva.set(isDisabled);
    }
}
