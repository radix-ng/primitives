import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, inject, input, signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

let fieldId = 0;

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * External owner of field state. An adapter (e.g. a future Signal Forms
 * `[rdxSignalField]` directive, or a Reactive Forms bridge) registers one via
 * `setStateProvider` so Field reads authoritative form state instead of
 * self-computing it from the DOM. Each member is an optional signal-like
 * accessor; only the states the adapter owns need to be provided — the rest
 * fall back to the root's inputs / DOM heuristic. Keeping these as plain
 * `() => boolean` accessors keeps Field framework-agnostic (no dependency on
 * `@angular/forms/signals`).
 *
 * See ADR 0004 and `signal-forms-readiness.md` (prep #4).
 */
export interface RdxFieldState {
    invalid?: () => boolean;
    disabled?: () => boolean;
    required?: () => boolean;
    dirty?: () => boolean;
    touched?: () => boolean;
    filled?: () => boolean;
    focused?: () => boolean;
}

const addId = (ids: string[], id: string) => (ids.includes(id) ? ids : [...ids, id]);
const removeId = (ids: string[], id: string) => ids.filter((item) => item !== id);

const fieldRootContext = () => {
    const root = injectFieldRoot();

    return {
        controlId: root.controlId,
        descriptionIds: root.descriptionIds,
        errorIds: root.errorIds,
        invalidState: root.invalidState,
        disabledState: root.disabledState,
        requiredState: root.requiredState,
        dirtyState: root.dirtyState,
        touchedState: root.touchedState,
        filledState: root.filledState,
        focusedState: root.focusedState,
        setControlId: (id: string) => root.controlId.set(id),
        addDescriptionId: (id: string) => root.descriptionIds.update((ids) => addId(ids, id)),
        removeDescriptionId: (id: string) => root.descriptionIds.update((ids) => removeId(ids, id)),
        addErrorId: (id: string) => root.errorIds.update((ids) => addId(ids, id)),
        removeErrorId: (id: string) => root.errorIds.update((ids) => removeId(ids, id)),
        setFocused: (value: boolean) => root.focusedValue.set(value),
        setFilled: (value: boolean) => root.filledValue.set(value),
        setDirty: (value: boolean) => root.dirtyValue.set(value),
        setTouched: (value: boolean) => root.touchedValue.set(value),
        /**
         * Register (or clear with `null`) an external owner of field state.
         * While a provider is registered, any state it exposes takes precedence
         * over the root inputs and the DOM-derived values. Returns the previous
         * provider so adapters can restore it on teardown.
         */
        setStateProvider: (provider: RdxFieldState | null) => root.setStateProvider(provider),
        hasStateProvider: root.hasStateProvider
    };
};

export type RdxFieldRootContext = ReturnType<typeof fieldRootContext>;

export const [injectFieldRootContext, provideFieldRootContext] = createContext<RdxFieldRootContext>('RdxFieldRoot');

/**
 * Groups a form control with its label, description, error message, and field state.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxFieldRoot]',
    exportAs: 'rdxFieldRoot',
    providers: [provideFieldRootContext(fieldRootContext)],
    host: {
        '[attr.data-invalid]': 'dataAttr(invalidState())',
        '[attr.data-valid]': 'dataAttr(!invalidState())',
        '[attr.data-disabled]': 'dataAttr(disabledState())',
        '[attr.data-required]': 'dataAttr(requiredState())',
        '[attr.data-dirty]': 'dataAttr(dirtyState())',
        '[attr.data-touched]': 'dataAttr(touchedState())',
        '[attr.data-filled]': 'dataAttr(filledState())',
        '[attr.data-focused]': 'dataAttr(focusedState())'
    }
})
export class RdxFieldRoot {
    /**
     * Whether the field is invalid.
     *
     * @group Props
     * @defaultValue false
     */
    readonly invalid = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the field is disabled.
     *
     * @group Props
     * @defaultValue false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the field is required.
     *
     * @group Props
     * @defaultValue false
     */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the field value has changed from its initial value.
     *
     * @group Props
     * @defaultValue false
     */
    readonly dirty = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the field has been blurred after receiving focus.
     *
     * @group Props
     * @defaultValue false
     */
    readonly touched = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Overrides whether the control has a non-empty value.
     *
     * @group Props
     */
    readonly filled = input<boolean>();

    /**
     * Overrides whether the control is focused.
     *
     * @group Props
     */
    readonly focused = input<boolean>();

    readonly controlId = signal(`rdx-field-control-${fieldId++}`);
    readonly descriptionIds = signal<string[]>([]);
    readonly errorIds = signal<string[]>([]);

    readonly focusedValue = signal(false);
    readonly filledValue = signal(false);
    readonly dirtyValue = signal(false);
    readonly touchedValue = signal(false);

    /** External state owner registered through the context; `null` when Field self-computes. */
    private readonly stateProvider = signal<RdxFieldState | null>(null);

    /** Whether an external adapter currently owns field state. */
    readonly hasStateProvider = computed(() => this.stateProvider() !== null);

    readonly invalidState = computed(() => this.resolve('invalid', () => this.invalid()));
    readonly disabledState = computed(() => this.resolve('disabled', () => this.disabled()));
    readonly requiredState = computed(() => this.resolve('required', () => this.required()));
    readonly dirtyState = computed(() => this.resolve('dirty', () => this.dirty() || this.dirtyValue()));
    readonly touchedState = computed(() => this.resolve('touched', () => this.touched() || this.touchedValue()));
    readonly filledState = computed(() => this.resolve('filled', () => this.filled() ?? this.filledValue()));
    readonly focusedState = computed(() => this.resolve('focused', () => this.focused() ?? this.focusedValue()));

    protected readonly dataAttr = attr;

    /**
     * Register an external owner of field state, returning the previous one.
     * @ignore
     */
    setStateProvider(provider: RdxFieldState | null): RdxFieldState | null {
        const previous = this.stateProvider();
        this.stateProvider.set(provider);
        return previous;
    }

    /**
     * Prefer the registered provider's value for `key` when it exposes one,
     * otherwise fall back to the root inputs / DOM-derived signals.
     */
    private resolve(key: keyof RdxFieldState, fallback: () => boolean): boolean {
        const accessor = this.stateProvider()?.[key];
        return accessor ? accessor() : fallback();
    }
}

function injectFieldRoot(): RdxFieldRoot {
    return inject(RdxFieldRoot);
}
