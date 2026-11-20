import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    model,
    OnChanges,
    output,
    signal,
    Signal,
    SimpleChanges
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
    BooleanInput,
    createContext,
    provideFormUiState,
    provideValueAccessor,
    RdxCancelableChangeEventDetails,
    RdxFormUiControlBase,
    RdxFormUiStateHost,
    RdxFormUiTouchTarget,
    RdxFormValueControl,
    serializeNativeFormValue,
    useNativeFormControl,
    watch
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
    allValues: Signal<string[] | undefined>;
    /** Native field name when the group serializes its selection. */
    name: Signal<string | undefined>;
    /** External owning form id inherited by optional child native inputs. */
    form: Signal<string | undefined>;
    /** Whether the whole group is disabled. */
    disabled: Signal<boolean>;
    /** The derived state of a `parent` checkbox: all / none / some checked. */
    parentState: Signal<CheckedState>;
    /** The space-separated control ids the `parent` checkbox controls (for `aria-controls`). */
    controlledIds: Signal<string | undefined>;
    /** Apply a child's checked request. */
    setItemChecked: (value: string, checked: boolean, details: RdxCheckboxGroupValueChangeEventDetails) => boolean;
    /** Toggle every child on or off (used by a `parent` checkbox). */
    toggleAll: (details: RdxCheckboxGroupValueChangeEventDetails) => boolean;
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
        value: group.currentValue,
        allValues: group.allValues,
        name: group.name,
        form: group.form,
        disabled: group.disabledState,
        parentState: group.parentState,
        controlledIds: group.controlledIds,
        setItemChecked: (value, checked, details) => group.setItemChecked(value, checked, details),
        toggleAll: (details) => group.toggleAll(details),
        registerChild: (value, disabled) => group.registerChild(value, disabled),
        registerControl: (value, id) => group.registerControl(value, id)
    };
};

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
    implements ControlValueAccessor, RdxFormValueControl<string[]>, OnChanges
{
    /** The values of the currently checked checkboxes. Use with `onValueChange` or `[(value)]`. */
    readonly value = model<string[]>([]);

    /** Parent-owned selection. A defined array takes precedence over the editable model. */
    readonly controlledValue = input<string[]>();
    /** The effective selection shared by the group and its children. */
    readonly currentValue = computed(() => this.controlledValue() ?? this.value());

    /** The values checked initially when the group is uncontrolled. */
    readonly defaultValue = input<string[]>();

    /** All checkbox values in the group. Required for a `parent` (select-all) checkbox. */
    readonly allValues = input<string[]>();

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
        const values = this.allValues();
        if (!values) return false;
        const count = this.currentValue().length;
        if (count === values.length) {
            return true;
        }
        return count > 0 ? 'indeterminate' : false;
    });

    /**
     * The value as last set directly by a child (or the initial value) — the "remembered" partial
     * selection that a `parent` checkbox cycles back to, mirroring Base UI's `uncontrolledStateRef`.
     */
    private uncontrolledState: string[] = [];
    /** Where the parent is in its mixed → on → off cycle. Reset to `mixed` on any direct child change. */
    private parentStatus: 'on' | 'off' | 'mixed' = 'mixed';
    /** Per-value disabled signals, so the parent can preserve disabled-but-checked children. */
    private readonly disabledByValue = signal(new Map<string, readonly Signal<boolean>[]>());

    /** Rendered control ids in registration order, including repeated child values. */
    private readonly controlIds = signal(new Map<string, readonly string[]>());

    /** The space-separated control ids in `allValues` order, for the parent's `aria-controls`. */
    readonly controlledIds = computed(() => {
        const ids = this.controlIds();
        return (
            this.allValues()
                ?.flatMap((value) => ids.get(value) ?? [])
                .join(' ') || undefined
        );
    });

    private hasValueInput = false;
    private hasCvaValue = false;
    private onChange: (value: string[]) => void = () => {
        /* Empty */
    };
    onTouched: () => void = () => {
        /* Empty */
    };

    private readonly browserForm = useNativeFormControl({
        name: this.name,
        form: this.form,
        disabled: this.disabledState,
        value: this.currentValue,
        serialize: (values) => serializeNativeFormValue(values.filter((value) => !this.isValueDisabled(value))),
        defaultValue: () => [...this.initialValue()],
        onReset: (value) => {
            if (this.controlledValue() !== undefined) return;

            if (!this.resetNgControl(undefined)) this.value.set([...value]);
            this.uncontrolledState = [...this.currentValue()];
            this.parentStatus = 'mixed';
            this.reset();
        }
    });

    constructor() {
        super();

        watch([], () => {
            if (this.controlledValue() === undefined) this.value.set(this.initialValue());
            this.uncontrolledState = [...this.currentValue()];
        });
    }

    /** @ignore */
    // eslint-disable-next-line no-restricted-syntax -- Observe initial model input presence, including an empty selection (ADR 0071).
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value']?.currentValue !== undefined) this.hasValueInput = true;
    }

    private initialValue(): string[] {
        const controlled = this.controlledValue();
        if (controlled !== undefined) return controlled;
        if (this.hasValueInput || this.hasCvaValue || this.value().length > 0) return this.value();
        const value = this.defaultValue();
        return value === undefined ? this.value() : [...value];
    }

    /** @ignore Bridge the CVA `onTouched` so `markAsTouched()` also notifies Reactive/template forms. */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return { markAsTouched: () => this.onTouched() };
    }

    /** @ignore Register a child's disabled signal keyed by its value. */
    registerChild(value: string, disabled: Signal<boolean>): () => void {
        this.disabledByValue.update((items) => new Map(items).set(value, [...(items.get(value) ?? []), disabled]));
        return () => {
            this.disabledByValue.update((items) => {
                const next = new Map(items);
                const remaining = (items.get(value) ?? []).filter((source) => source !== disabled);
                if (remaining.length) next.set(value, remaining);
                else next.delete(value);
                return next;
            });
        };
    }

    /** @ignore Register a child's control element id so the parent can list it in `aria-controls`. */
    registerControl(value: string, id: string): () => void {
        this.controlIds.update((ids) => new Map(ids).set(value, [...(ids.get(value) ?? []), id]));
        return () => {
            this.controlIds.update((ids) => {
                const next = new Map(ids);
                const remaining = (ids.get(value) ?? []).filter((entry) => entry !== id);
                if (remaining.length) next.set(value, remaining);
                else next.delete(value);
                return next;
            });
        };
    }

    /** @ignore Apply an item request after the child has had a chance to cancel it. */
    setItemChecked(value: string, checked: boolean, details: RdxCheckboxGroupValueChangeEventDetails): boolean {
        if (this.disabledState()) return false;

        const next = [...this.currentValue()];
        const index = next.indexOf(value);
        if (checked && index === -1) next.push(value);
        else if (!checked && index !== -1) next.splice(index, 1);
        if (!this.emit(next, details)) return false;

        this.uncontrolledState = next;
        this.parentStatus = 'mixed';
        return true;
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
    toggleAll(details: RdxCheckboxGroupValueChangeEventDetails): boolean {
        const allValues = this.allValues();
        if (!allValues || this.disabledState()) return false;
        const remembered = this.uncontrolledState;

        // Disabled children that were checked stay checked through every transition.
        const none = allValues.filter((value) => this.isValueDisabled(value) && remembered.includes(value));
        const all = allValues.filter((value) => !this.isValueDisabled(value) || remembered.includes(value));

        const rememberedIsAllOrNone = remembered.length === all.length || remembered.length === 0;
        if (rememberedIsAllOrNone) {
            return this.emit(this.currentValue().length === all.length ? none : all, details);
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

        if (!this.emit(nextValue, details)) return false;
        this.parentStatus = nextStatus;
        return true;
    }

    private isValueDisabled(value: string): boolean {
        return (
            this.disabledByValue()
                .get(value)
                ?.every((disabled) => disabled()) ?? false
        );
    }

    private emit(next: string[], eventDetails: RdxCheckboxGroupValueChangeEventDetails): boolean {
        this.onValueChange.emit({ value: next, eventDetails });
        if (eventDetails.isCanceled() || eventDetails.event.defaultPrevented) return false;
        if (this.controlledValue() !== undefined) return true;

        this.value.set(next);
        this.formUi.markDirty();
        this.onChange(next);
        this.browserForm.sync();
        return true;
    }

    /** @ignore */
    writeValue(value: string[] | null): void {
        this.hasCvaValue = true;
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
