import { booleanAttribute, computed, DestroyRef, Directive, ElementRef, inject, input, signal } from '@angular/core';
import { BooleanInput, createContext, RdxValidationError } from '@radix-ng/primitives/core';
import { injectFormRootContext, RdxFormFieldRegistration } from '@radix-ng/primitives/form';

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
    /**
     * Optional source of error *content* (not just the invalid boolean). When provided and non-empty
     * it forces `invalidState` true, and its messages (`message ?? kind` per error) surface through
     * `RdxFieldError.messages()` ahead of any enclosing Form's external messages. Uses `core`'s
     * framework-free shim type so the seam stays free of `@angular/forms/signals` (ADR 0004 amendment).
     */
    errors?: () => RdxValidationError[];
}

const addId = (ids: string[], id: string) => (ids.includes(id) ? ids : [...ids, id]);
const removeId = (ids: string[], id: string) => ids.filter((item) => item !== id);

const fieldRootContext = () => {
    const root = injectFieldRoot();

    return {
        controlId: root.controlId,
        name: root.name,
        descriptionIds: root.descriptionIds,
        errorIds: root.errorIds,
        /** Combined external messages (state provider's, then enclosing Form's), for `RdxFieldError`. */
        messages: root.messages,
        /** Notify an enclosing Form that this field's control was edited (composite-control opt-in). */
        notifyEdited: () => root.notifyEdited(),
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
        '[attr.data-focused]': 'dataAttr(focusedState())',
        '(input)': 'notifyEdited()',
        '(change)': 'notifyEdited()'
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

    /**
     * Identifies the field to an enclosing Form for external (server) error matching. Fields without a
     * `name` never match external errors.
     *
     * @group Props
     */
    readonly name = input<string>();

    /** The enclosing Form, if any. All Form-related behavior is a no-op when this is `null`. */
    private readonly formContext = injectFormRootContext(true);

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

    /** Error content from a registered state provider (e.g. a Signal Forms adapter). */
    private readonly providerErrors = computed(() => this.stateProvider()?.errors?.() ?? []);

    /** External messages from the enclosing Form matched by this field's `name`. */
    readonly externalErrors = computed(() => this.formContext?.errorsFor(this.name()) ?? []);

    /** Provider messages first (`message ?? kind`), then the Form's external messages. */
    readonly messages = computed(() => [
        ...this.providerErrors().map((error) => error.message ?? error.kind),
        ...this.externalErrors()
    ]);

    // External errors (provider content or Form server errors) force invalid regardless of the input or
    // a provider's `invalid` accessor — a server error must show even when client-side validity passes.
    readonly invalidState = computed(() => {
        if (this.externalErrors().length > 0 || this.providerErrors().length > 0) {
            return true;
        }
        return this.resolve('invalid', () => this.invalid());
    });
    readonly disabledState = computed(() => this.resolve('disabled', () => this.disabled()));
    readonly requiredState = computed(() => this.resolve('required', () => this.required()));
    readonly dirtyState = computed(() => this.resolve('dirty', () => this.dirty() || this.dirtyValue()));
    readonly touchedState = computed(() => this.resolve('touched', () => this.touched() || this.touchedValue()));
    readonly filledState = computed(() => this.resolve('filled', () => this.filled() ?? this.filledValue()));
    readonly focusedState = computed(() => this.resolve('focused', () => this.focused() ?? this.focusedValue()));

    protected readonly dataAttr = attr;

    constructor() {
        // Register with an enclosing Form (if any) for aggregate state, submit guard, and reset; a
        // standalone field never enters this branch and behaves exactly as before.
        const formContext = this.formContext;
        if (formContext) {
            const registration: RdxFormFieldRegistration = {
                name: () => this.name(),
                invalid: () => this.invalidState(),
                dirty: () => this.dirtyState(),
                touched: () => this.touchedState(),
                focus: () => this.focusControl(),
                resetState: () => this.resetState()
            };
            const unregister = formContext.register(registration);
            inject(DestroyRef).onDestroy(unregister);
        }
    }

    /** Notify the enclosing Form (if any) that this field's control was edited (clear-on-edit). */
    notifyEdited(): void {
        this.formContext?.notifyEdited(this.name());
    }

    /** Reset interaction state on native form reset: touched/dirty/focused → false, filled re-synced. */
    resetState(): void {
        this.touchedValue.set(false);
        this.dirtyValue.set(false);
        this.focusedValue.set(false);
        const control = this.controlElement();
        const value = control?.value ?? '';
        this.filledValue.set(value != null && value !== '');
    }

    /** Focus the field's control (used by the Form's first-invalid-focus on blocked submit). */
    private focusControl(): void {
        this.controlElement()?.focus();
    }

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    /**
     * The field's control element, found by `controlId` but scoped to this field's own subtree — a
     * duplicate or consumer-reused id elsewhere on the page can't steal focus/reset. The control
     * registers its id through `setControlId`, so this matches the same element the labels point at.
     */
    private controlElement(): HTMLInputElement | null {
        return this.host.querySelector<HTMLInputElement>(`[id="${this.controlId()}"]`);
    }

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
    private resolve(key: Exclude<keyof RdxFieldState, 'errors'>, fallback: () => boolean): boolean {
        const accessor = this.stateProvider()?.[key];
        return accessor ? accessor() : fallback();
    }
}

function injectFieldRoot(): RdxFieldRoot {
    return inject(RdxFieldRoot);
}
