import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    signal,
    Signal
} from '@angular/core';
import {
    BooleanInput,
    createContext,
    injectId,
    isValidationRevealed,
    RDX_DEFAULT_VALIDATION_MODE,
    RDX_FIELD_VALIDITY,
    RdxValidationError,
    RdxValidationMode
} from '@radix-ng/primitives/core';
import { injectFormRootContext, RdxFormFieldRegistration } from '@radix-ng/primitives/form';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * External owner of field state. An adapter (`rdxSignalField` or `rdxNgControlField`) registers one via
 * `setStateProvider` so Field reads authoritative form state instead of
 * self-computing it from the DOM. Each member is an optional signal-like
 * accessor; only the states the adapter owns need to be provided — the rest
 * fall back to the root's inputs / DOM heuristic. Keeping these as plain
 * `() => boolean` accessors keeps Field framework-agnostic (no dependency on
 * `@angular/forms/signals`).
 *
 * See ADR 0004, ADR 0021, and `signal-forms-readiness.md` (prep #4).
 */
export interface RdxFieldState {
    /** Field name inferred by an adapter. An explicit `rdxFieldRoot[name]` always wins. */
    name?: () => string | undefined;
    /**
     * The control's **actual** invalidity (ungated). The Field decides *when* to display it from its
     * `validationMode` (e.g. only after blur) — the adapter just reports the real state. A non-empty
     * `errors()` also counts as invalid.
     */
    invalid?: () => boolean;
    /** Whether async validation is pending. Pending validity remains neutral, never falsely valid. */
    pending?: () => boolean;
    disabled?: () => boolean;
    required?: () => boolean;
    dirty?: () => boolean;
    touched?: () => boolean;
    filled?: () => boolean;
    focused?: () => boolean;
    /**
     * Optional source of error *content* (not just the invalid boolean). A non-empty list marks the field
     * **actually** invalid (client validation) and its messages (`message ?? kind` per error) surface
     * through `RdxFieldError.messages()` once the field's `validationMode` reveals client validity, ahead of
     * any enclosing Form's server messages. Uses `core`'s framework-free shim type so the seam stays free of
     * `@angular/forms/signals` (ADR 0004 amendment).
     */
    errors?: () => readonly RdxValidationError[];
}

const addId = (ids: string[], id: string) => (ids.includes(id) ? ids : [...ids, id]);
const removeId = (ids: string[], id: string) => ids.filter((item) => item !== id);

export interface RdxFieldRootContext {
    controlId: Signal<string>;
    name: Signal<string | undefined>;
    descriptionIds: Signal<string[]>;
    errorIds: Signal<string[]>;
    messages: Signal<string[]>;
    /** Whether the currently displayed client errors contain this validation kind. */
    matchesError: (kind: string) => boolean;
    notifyEdited: () => void;
    /** Tri-state *displayed* validity (`true` valid / `false` invalid / `null` neutral), gated by the
     * field's `validationMode`. The source for `data-valid` / `data-invalid` on the field and its controls. */
    validState: Signal<boolean | null>;
    /** Whether the enclosing Form has had a submit attempted (always `false` with no Form). */
    formSubmitAttempted: Signal<boolean>;
    invalidState: Signal<boolean>;
    disabledState: Signal<boolean>;
    requiredState: Signal<boolean>;
    dirtyState: Signal<boolean>;
    touchedState: Signal<boolean>;
    filledState: Signal<boolean>;
    focusedState: Signal<boolean>;
    setControlId: (id: string) => void;
    addDescriptionId: (id: string) => void;
    removeDescriptionId: (id: string) => void;
    addErrorId: (id: string) => void;
    removeErrorId: (id: string) => void;
    setFocused: (value: boolean) => void;
    setFilled: (value: boolean) => void;
    setDirty: (value: boolean) => void;
    setTouched: (value: boolean) => void;
    setStateProvider: (provider: RdxFieldState | null) => RdxFieldState | null;
    /**
     * Identity-checked teardown: roll the slot back to `previous` only if `provider` is still the
     * active one. A newer adapter that registered after `provider` (create-before-destroy during a
     * view swap) owns the slot and must not be clobbered by the old adapter's destroy.
     */
    clearStateProvider: (provider: RdxFieldState | null, previous: RdxFieldState | null) => void;
    hasStateProvider: Signal<boolean>;
}

const fieldRootContext = (): RdxFieldRootContext => {
    const root = injectFieldRoot();

    return {
        controlId: root.controlId,
        name: root.effectiveName,
        descriptionIds: root.descriptionIds,
        errorIds: root.errorIds,
        /** Combined messages for `RdxFieldError`: client (provider + form name-routing, when revealed) then
         * server (`errors` input, always). */
        messages: root.messages,
        matchesError: (kind: string) => root.matchesError(kind),
        /** Notify an enclosing Form that this field's control was edited (composite-control opt-in). */
        notifyEdited: () => root.notifyEdited(),
        validState: root.validState,
        formSubmitAttempted: root.formSubmitAttempted,
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
        clearStateProvider: (provider: RdxFieldState | null, previous: RdxFieldState | null) =>
            root.clearStateProvider(provider, previous),
        hasStateProvider: root.hasStateProvider
    };
};

export const [injectFieldRootContext, provideFieldRootContext] = createContext<RdxFieldRootContext>(
    'RdxFieldRoot',
    'components/field'
);

/**
 * Groups a form control with its label, description, error message, and field state.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxFieldRoot]',
    exportAs: 'rdxFieldRoot',
    providers: [
        provideFieldRootContext(fieldRootContext),
        // Expose the tri-state display validity so controls inside the field reflect it (single source).
        { provide: RDX_FIELD_VALIDITY, useFactory: () => inject(RdxFieldRoot).validState }
    ],
    host: {
        // Tri-state: `data-invalid` when displayed-invalid, `data-valid` only when displayed-valid,
        // and **neither** when neutral (`validState()` is `null`).
        '[attr.data-invalid]': 'dataAttr(validState() === false)',
        '[attr.data-valid]': 'dataAttr(validState() === true)',
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

    /**
     * Overrides when this field reveals its validity (error styling + message). Falls back to the
     * enclosing `rdxFormRoot`'s `validationMode`, then `'onBlur'`. Server errors always show regardless.
     *
     * @group Props
     */
    readonly validationMode = input<RdxValidationMode>();

    /** The enclosing Form, if any. All Form-related behavior is a no-op when this is `null`. */
    private readonly formContext = injectFormRootContext(true);

    readonly controlId = signal(injectId('rdx-field-control-'));
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

    /** Explicit field name wins; an adapter may infer one from its form-control binding. */
    readonly effectiveName = computed(() => this.name() ?? this.stateProvider()?.name?.());

    /** Error content from a registered state provider (e.g. a Signal Forms adapter). */
    private readonly providerErrors = computed(() => this.stateProvider()?.errors?.() ?? []);

    /** **Client** validation errors routed by a form-level provider (`rdxSignalForm`) — gated by `validationMode`. */
    private readonly clientErrors = computed(() => this.formContext?.clientErrorsFor(this.effectiveName()) ?? []);

    /** **Server/external** errors from the Form's `errors` input — shown eagerly (never gated). */
    private readonly serverErrors = computed(() => this.formContext?.externalErrorsFor(this.effectiveName()) ?? []);

    /** Whether the enclosing Form has had a submit attempted; `false` when standalone. A presentation
     * seam an adapter can read to reveal errors after a submit attempt (Base UI's submit-attempt state). */
    readonly formSubmitAttempted = computed(() => this.formContext?.submitAttempted() ?? false);

    /**
     * Client messages first (per-field `rdxSignalField` provider, then form-level `rdxSignalForm`
     * name-routing) — only once `validationMode` reveals client validity — then the Form's **server**
     * messages (the `errors` input), which always show. **Deduped by text**: a field can receive the same
     * Signal Forms error from both a per-field provider and the form-level routing (they read the same
     * field state), so deduping renders it once while still surfacing distinct messages from each source.
     */
    readonly messages = computed(() => {
        // **Client** messages (per-field `rdxSignalField` provider + form-level `rdxSignalForm` routing)
        // surface only once the field's `validationMode` reveals them; **server** messages (the `errors`
        // input) always show. So a neutral field stays empty and the polite live region announces on reveal.
        const client = this.validationRevealed()
            ? [...this.providerErrors().map((error) => error.message ?? error.kind), ...this.clientErrors()]
            : [];
        const seen = new Set<string>();
        const result: string[] = [];
        for (const message of [...client, ...this.serverErrors()]) {
            if (message && !seen.has(message)) {
                seen.add(message);
                result.push(message);
            }
        }
        return result;
    });

    /** Whether a client validation error of `kind` is currently revealed by the field. */
    matchesError(kind: string): boolean {
        return this.validationRevealed() && this.providerErrors().some((error) => error.kind === kind);
    }

    /** Effective validation-display mode: this field's override → the enclosing Form's → the default. */
    readonly effectiveValidationMode = computed<RdxValidationMode>(
        () => this.validationMode() ?? this.formContext?.validationMode() ?? RDX_DEFAULT_VALIDATION_MODE
    );

    /** Whether client-side validity is revealed yet, per {@link effectiveValidationMode} + interaction. */
    private readonly validationRevealed = computed(() =>
        isValidationRevealed(this.effectiveValidationMode(), {
            touched: this.touchedState(),
            dirty: this.dirtyState(),
            submitAttempted: this.formSubmitAttempted()
        })
    );

    /**
     * Client-side invalidity (gated by `validationMode`): the per-field provider's error content / `invalid`
     * (`rdxSignalField`), a form-level provider's name-routed errors (`rdxSignalForm`), or the `[invalid]`
     * input. Excludes server errors (which are eager).
     */
    private readonly clientInvalidState = computed(
        () =>
            this.providerErrors().length > 0 ||
            this.clientErrors().length > 0 ||
            this.resolve('invalid', () => this.invalid())
    );

    /**
     * Tri-state *displayed* validity (`boolean | null`) — the source for `data-valid` / `data-invalid`.
     * Server errors show immediately; client-side validity (including `rdxSignalForm` name-routing) stays
     * **neutral** (`null`) until the field's {@link effectiveValidationMode} reveals it, then `false`/`true`.
     */
    readonly validState = computed<boolean | null>(() => {
        if (this.serverErrors().length > 0) {
            return false;
        }
        // Angular Forms distinguishes pending from both valid and invalid. Preserve Base UI's
        // tri-state presentation by publishing neither validity attribute while validation settles.
        if (this.pendingState()) {
            return null;
        }
        // A disabled Angular control does not participate in validation. Keep it neutral unless an
        // explicit invalid/error source still marks it invalid (matching Base UI's controlled-invalid
        // precedence over computed disabled validity).
        if (this.disabledState() && !this.clientInvalidState()) {
            return null;
        }
        if (!this.validationRevealed()) {
            return null;
        }
        return this.clientInvalidState() ? false : true;
    });

    /**
     * Boolean **displayed** invalidity (= `validState() === false`), used by `rdxFieldError` (hidden) and
     * `rdxFieldControl`'s `aria-describedby` error linking. A neutral (`null`) `validState` reads as not
     * invalid here, so the error region stays hidden until the field's mode reveals it.
     */
    readonly invalidState = computed(() => this.validState() === false);

    /**
     * Boolean **actual** invalidity — ungated by the display mode. The enclosing Form aggregates this into
     * `anyInvalid` (→ submit-block / focus-first-invalid), so a field that is really invalid but displayed
     * neutral still blocks submit. The form's presentation `data-invalid` comes from the *displayed*
     * aggregate (`anyDisplayedInvalid`) instead — not from this. Server errors + provider error content +
     * the provider/input `invalid`.
     */
    readonly actualInvalidState = computed(() => this.serverErrors().length > 0 || this.clientInvalidState());
    readonly pendingState = computed(() => this.resolve('pending', () => false));
    readonly disabledState = computed(() => this.resolve('disabled', () => this.disabled()));
    readonly requiredState = computed(() => this.resolve('required', () => this.required()));
    // `touched`/`dirty` also OR in the enclosing Form's per-name state (`rdxSignalForm` name-routing), so a
    // field with only a bare `[formField]` (no `rdxSignalField`/`rdxFieldControl`) still reveals on blur.
    readonly dirtyState = computed(
        () =>
            this.resolve('dirty', () => this.dirty() || this.dirtyValue()) ||
            (this.formContext?.dirtyFor(this.effectiveName()) ?? false)
    );
    readonly touchedState = computed(
        () =>
            this.resolve('touched', () => this.touched() || this.touchedValue()) ||
            (this.formContext?.touchedFor(this.effectiveName()) ?? false)
    );
    readonly filledState = computed(() => this.resolve('filled', () => this.filled() ?? this.filledValue()));
    readonly focusedState = computed(() => this.resolve('focused', () => this.focused() ?? this.focusedValue()));

    protected readonly dataAttr = attr;

    constructor() {
        // Register with an enclosing Form (if any) for aggregate state, submit guard, and reset; a
        // standalone field never enters this branch and behaves exactly as before.
        const formContext = this.formContext;
        if (formContext) {
            const registration: RdxFormFieldRegistration = {
                name: () => this.effectiveName(),
                // `invalid` reports *actual* validity (ungated) — `form.anyInvalid` + the submit guard must
                // reflect real state even before a field reveals it. `displayValid` reports the *gated*
                // tri-state so the form's presentation `data-invalid` stays neutral on load.
                invalid: () => this.actualInvalidState(),
                displayValid: () => this.validState(),
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
        this.formContext?.notifyEdited(this.effectiveName());
    }

    /** Reset interaction state on native form reset: touched/dirty/focused → false, filled re-synced. */
    resetState(): void {
        this.touchedValue.set(false);
        this.dirtyValue.set(false);
        this.focusedValue.set(false);
        const control = this.controlElement();
        const value = control && 'value' in control ? (control as HTMLInputElement).value : '';
        this.filledValue.set(value != null && value !== '');
    }

    /** Focus the field's control (used by the Form's first-invalid-focus on blocked submit). */
    private focusControl(): void {
        const control = this.controlElement();
        if (!control) {
            return;
        }
        control.focus();
        // Base UI selects text after focusing an invalid input so the user can replace it immediately.
        if (control.tagName === 'INPUT') {
            (control as HTMLInputElement).select();
        }
    }

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    /**
     * The field's control element, found by `controlId` but scoped to this field's own subtree — a
     * duplicate or consumer-reused id elsewhere on the page can't steal focus/reset. The control
     * registers its id through `setControlId`, so this matches the same element the labels point at.
     */
    private controlElement(): HTMLElement | null {
        return this.host.querySelector<HTMLElement>(`[id="${this.controlId()}"]`);
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
     * Identity-checked teardown — roll back to `previous` only if `provider` is still active. Prevents
     * an old adapter's destroy from clobbering a newer adapter that registered after it (create-before-
     * destroy during a structural view swap).
     */
    clearStateProvider(provider: RdxFieldState | null, previous: RdxFieldState | null): void {
        if (this.stateProvider() === provider) {
            this.stateProvider.set(previous);
        }
    }

    /**
     * Prefer the registered provider's value for `key` when it exposes one,
     * otherwise fall back to the root inputs / DOM-derived signals. `name` and `errors` are resolved
     * separately, so they're excluded from this boolean key.
     */
    private resolve(key: Exclude<keyof RdxFieldState, 'name' | 'errors'>, fallback: () => boolean): boolean {
        const accessor = this.stateProvider()?.[key];
        return accessor ? accessor() : fallback();
    }
}

function injectFieldRoot(): RdxFieldRoot {
    return inject(RdxFieldRoot);
}
