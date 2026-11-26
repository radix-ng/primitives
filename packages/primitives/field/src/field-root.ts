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
    createLabelRegistry,
    isValidationRevealed,
    RDX_DEFAULT_VALIDATION_MODE,
    RDX_FIELD_VALIDITY,
    RdxLabelRegistry,
    RdxValidationError,
    RdxValidationMode
} from '@radix-ng/primitives/core';
import { injectFieldsetRootContext } from '@radix-ng/primitives/fieldset';
import { injectFormRootContext, RdxFormFieldRegistration } from '@radix-ng/primitives/form';
import { createFieldAssociations, createFieldIdRegistry } from './field-description-ids';
import { type RdxFieldNativeControl, useFieldNativeValidity } from './field-value-missing';

const attr = (value: boolean) => (value ? '' : undefined);
const optionalBoolean = (value: BooleanInput) => (value === undefined ? undefined : booleanAttribute(value));
const fieldHosts = new WeakSet<EventTarget>();
const nativeErrorKinds = [
    'badInput',
    'customError',
    'patternMismatch',
    'rangeOverflow',
    'rangeUnderflow',
    'stepMismatch',
    'tooLong',
    'tooShort',
    'typeMismatch',
    'valueMissing'
] as const;

/**
 * External owner of field state. An adapter (`rdxSignalField` or `rdxNgControlField`) registers one via
 * `registerStateProvider` so Field reads authoritative form state instead of
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

/** @internal Composite control state that Field cannot derive from its native host. */
export interface RdxFieldControlState {
    filled: () => boolean;
    blurred: () => boolean;
    changed: () => boolean;
    /** Browser constraint errors published by the control. */
    nativeErrors?: () => readonly RdxValidationError[];
    /** A control with its own edit transaction reports accepted edits directly. */
    ownsNativeEdit?: (target: EventTarget | null) => boolean;
    /** Read the latest DOM validity before the form decides whether to submit. */
    refreshNativeValidity?: () => void;
    /** Visible control for the active browser constraint error, if any. */
    invalidFocusTarget?: () => HTMLElement | null;
    /** Entries for the enclosing Form when the control is portaled without a native form owner. */
    portaledEntries?: RdxFormFieldRegistration['portaledEntries'];
}

export interface RdxFieldRootContext extends RdxLabelRegistry {
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
    pendingState: Signal<boolean>;
    invalidState: Signal<boolean>;
    disabledState: Signal<boolean>;
    requiredState: Signal<boolean>;
    dirtyState: Signal<boolean>;
    touchedState: Signal<boolean>;
    filledState: Signal<boolean>;
    focusedState: Signal<boolean>;
    setControlId: (id: string) => void;
    registerControlId: (id: string) => () => void;
    registerDescription: (id: string) => () => void;
    registerError: (id: string) => () => void;
    setFocused: (value: boolean, owner?: object) => void;
    setFilled: (value: boolean) => void;
    /** @internal Register a composite control's presentation state. */
    registerControlState: (state: RdxFieldControlState) => () => void;
    /** @internal Register a native Field Control's validity and focus target. */
    registerNativeControl: (control: RdxFieldNativeControl) => () => void;
    setDirty: (value: boolean) => void;
    setTouched: (value: boolean) => void;
    /** Registers a metadata provider until the returned cleanup runs. The latest live registration wins. */
    registerStateProvider: (provider: RdxFieldState) => () => void;
    hasStateProvider: Signal<boolean>;
}

const fieldRootContext = (): RdxFieldRootContext => {
    const root = injectFieldRoot();

    return {
        ...root.labelRegistry,
        ...root.associations,
        name: root.effectiveName,
        errorIds: root.errorIds,
        registerError: root.errorsRegistry.register,
        /** Combined messages for `RdxFieldError`: client (provider + form name-routing, when revealed) then
         * server (`errors` input, always). */
        messages: root.messages,
        matchesError: (kind: string) => root.matchesError(kind),
        /** Notify an enclosing Form that this field's control was edited (composite-control opt-in). */
        notifyEdited: () => root.notifyEdited(),
        validState: root.validState,
        formSubmitAttempted: root.formSubmitAttempted,
        pendingState: root.pendingState,
        invalidState: root.invalidState,
        disabledState: root.disabledState,
        requiredState: root.requiredState,
        dirtyState: root.dirtyState,
        touchedState: root.touchedState,
        filledState: root.filledState,
        focusedState: root.focusedState,
        setFocused: (value, owner) => root.setFocused(value, owner),
        setFilled: (value: boolean) => root.filledValue.set(value),
        registerControlState: (state) => root.registerControlState(state),
        registerNativeControl: (control) => root.registerNativeControl(control),
        setDirty: (value: boolean) => root.dirtyValue.set(value),
        setTouched: (value: boolean) => root.touchedValue.set(value),
        registerStateProvider: (provider) => root.registerStateProvider(provider),
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
        '(input)': 'onNativeEdit($event)',
        '(change)': 'onNativeEdit($event)'
    }
})
export class RdxFieldRoot {
    readonly labelRegistry = createLabelRegistry();
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
     * Overrides whether the field value has changed from its initial value.
     *
     * @group Props
     */
    readonly dirty = input<boolean | undefined, BooleanInput>(undefined, { transform: optionalBoolean });

    /**
     * Overrides whether the field has been blurred after receiving focus.
     *
     * @group Props
     */
    readonly touched = input<boolean | undefined, BooleanInput>(undefined, { transform: optionalBoolean });

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
    private readonly fieldsetContext = injectFieldsetRootContext(true);

    /** @ignore */
    readonly associations = createFieldAssociations();
    /** @ignore */
    readonly errorsRegistry = createFieldIdRegistry();
    readonly controlId = this.associations.controlId;
    readonly descriptionIds = this.associations.descriptionIds;
    readonly errorIds = this.errorsRegistry.ids;

    readonly focusedValue = signal(false);
    readonly filledValue = signal(false);
    private readonly controlState = signal<RdxFieldControlState | null>(null);
    private readonly nativeControls = new Set<RdxFieldNativeControl>();
    private readonly nativeValidity = useFieldNativeValidity(
        // A form adapter that reports invalidity owns validation for the plain Field Control.
        () => (this.stateProvider()?.invalid ? [] : this.nativeControls),
        () => null,
        nativeErrorKinds
    );
    readonly dirtyValue = signal(false);
    readonly touchedValue = signal(false);

    private readonly stateProviders = signal<readonly { provider: RdxFieldState }[]>([]);
    private readonly stateProvider = computed(() => this.stateProviders().at(-1)?.provider);

    /** Whether an external adapter currently owns field state. */
    readonly hasStateProvider = computed(() => this.stateProvider() !== undefined);

    /** Explicit field name wins; an adapter may infer one from its form-control binding. */
    readonly effectiveName = computed(() => this.name() ?? this.stateProvider()?.name?.());

    /** Error content from a registered state provider (e.g. a Signal Forms adapter). */
    private readonly providerErrors = computed(() => this.stateProvider()?.errors?.() ?? []);
    private readonly nativeErrors = computed(() => [
        ...(this.controlState()?.nativeErrors?.() ?? []),
        ...this.nativeValidity.nativeErrors()
    ]);

    /** **Client** validation errors routed by a form-level provider (`rdxSignalForm`) — gated by `validationMode`. */
    private readonly clientErrors = computed(() => this.formContext?.clientErrorsFor(this.effectiveName()) ?? []);

    /** **Server/external** errors from the Form's `errors` input — shown eagerly (never gated). */
    private readonly serverErrors = computed(() => this.formContext?.externalErrorsFor(this.effectiveName()) ?? []);

    /** Whether the enclosing Form has had a submit attempted; `false` when standalone. A presentation
     * seam an adapter can read to reveal errors after a submit attempt (Base UI's submit-attempt state). */
    readonly formSubmitAttempted = computed(() => this.formContext?.submitAttempted() ?? false);

    /**
     * Client messages appear when `validationMode` reveals them. Sources are native constraints,
     * the per-field provider and form-level name-routing. Form server errors always appear.
     * Messages shared by more than one source appear once.
     */
    readonly messages = computed(() => {
        const client = this.clientMessagesRevealed()
            ? [
                  ...this.nativeErrors().map((error) => error.message ?? error.kind),
                  ...this.providerErrors().map((error) => error.message ?? error.kind),
                  ...this.clientErrors()
              ]
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
        return (
            this.clientMessagesRevealed() &&
            (this.nativeErrors().some((error) => error.kind === kind) ||
                this.providerErrors().some((error) => error.kind === kind))
        );
    }

    /** Effective validation-display mode: this field's override → the enclosing Form's → the default. */
    readonly effectiveValidationMode = computed<RdxValidationMode>(
        () => this.validationMode() ?? this.formContext?.validationMode() ?? RDX_DEFAULT_VALIDATION_MODE
    );

    /** Whether client-side validity is revealed yet, per {@link effectiveValidationMode} + interaction. */
    private readonly validationRevealed = computed(() => {
        const control = this.controlState();
        return isValidationRevealed(this.effectiveValidationMode(), {
            touched: this.resolveTouched(() => this.touchedValue() || (control?.blurred() ?? false)),
            // A committed value change can reveal validity while the form provider stays pristine.
            dirty: this.dirtyState() || (control?.changed() ?? false),
            submitAttempted: this.formSubmitAttempted()
        });
    });

    private readonly clientMessagesRevealed = computed(
        () => this.validationRevealed() && (!this.pendingState() || this.nativeErrors().length > 0)
    );

    /**
     * Client-side invalidity (gated by `validationMode`): the per-field provider's error content / `invalid`
     * (`rdxSignalField`), a form-level provider's name-routed errors (`rdxSignalForm`), or the `[invalid]`
     * input. Excludes server errors (which are eager).
     */
    private readonly clientInvalidState = computed(
        () =>
            this.nativeErrors().length > 0 ||
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
        // A pending Angular validator is neutral while no known native constraint has failed.
        if (this.pendingState() && this.nativeErrors().length === 0) {
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
    readonly disabledState = computed(
        () => this.disabled() || Boolean(this.fieldsetContext?.disabledState() || this.stateProvider()?.disabled?.())
    );
    readonly requiredState = computed(() => this.resolve('required', () => this.required()));
    readonly dirtyState = computed(() => this.resolveDirty(this.dirtyValue));
    readonly touchedState = computed(() => this.resolveTouched(this.touchedValue));
    readonly filledState = computed(() =>
        this.resolve('filled', () => this.filled() ?? this.controlState()?.filled() ?? this.filledValue())
    );
    readonly focusedState = computed(() => this.resolve('focused', () => this.focused() ?? this.focusedValue()));

    protected readonly dataAttr = attr;

    constructor() {
        const destroyRef = inject(DestroyRef);
        fieldHosts.add(this.host);
        destroyRef.onDestroy(() => fieldHosts.delete(this.host));

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
                focusTarget: () => this.invalidFocusTarget(),
                refreshNativeValidity: () => {
                    this.controlState()?.refreshNativeValidity?.();
                    this.nativeValidity.refreshNativeValidity();
                },
                portaledEntries: () => this.controlState()?.portaledEntries?.(),
                resetState: () => this.resetState()
            };
            const unregister = formContext.register(registration);
            destroyRef.onDestroy(unregister);
        }
    }

    /** Notify the enclosing Form (if any) that this field's control was edited (clear-on-edit). */
    notifyEdited(): void {
        this.formContext?.notifyEdited(this.effectiveName());
    }

    private focusOwner?: object;

    /** @ignore Releases focus only for the control that last acquired it. */
    setFocused(value: boolean, owner?: object): void {
        if (value || owner === undefined || this.focusOwner === owner) {
            this.focusOwner = value ? owner : undefined;
            this.focusedValue.set(value);
        }
    }

    /** @ignore The composite control owns these observations through reset and hydration. */
    registerControlState(state: RdxFieldControlState): () => void {
        this.controlState.set(state);
        return () => {
            if (this.controlState() === state) this.controlState.set(null);
        };
    }

    /** @ignore */
    registerNativeControl(control: RdxFieldNativeControl): () => void {
        this.nativeControls.add(control);
        return () => this.nativeControls.delete(control);
    }

    /** Only the nearest Field clears its errors. Composite controls report their accepted edits. */
    protected onNativeEdit(event: Event): void {
        if (!this.formContext || event.defaultPrevented) return;
        const path = event.composedPath();
        if (path.find((target) => fieldHosts.has(target)) !== this.host) return;
        const target = path[0] ?? event.target;
        if (this.controlState()?.ownsNativeEdit?.(target)) return;
        if ((target as Element | null)?.hasAttribute?.('data-rdx-native-input')) return;
        this.notifyEdited();
    }

    /** Reset interaction state on native form reset: touched/dirty/focused → false, filled re-synced. */
    resetState(): void {
        this.touchedValue.set(false);
        this.dirtyValue.set(false);
        this.setFocused(false);
        const control = this.controlElement();
        const value = control && 'value' in control ? (control as HTMLInputElement).value : '';
        this.filledValue.set(value != null && value !== '');
    }

    /** Focus the field's control (used by the Form's first-invalid-focus on blocked submit). */
    private focusControl(): void {
        const control = this.invalidFocusTarget();
        if (!control) {
            return;
        }
        control.focus();
        // Base UI selects text after focusing an invalid input so the user can replace it immediately.
        if (control.tagName === 'INPUT') {
            (control as HTMLInputElement).select();
        }
    }

    private invalidFocusTarget(): HTMLElement | null {
        if (this.disabledState()) return null;
        const target =
            this.nativeValidity.invalidFocusTarget() ??
            this.controlState()?.invalidFocusTarget?.() ??
            this.controlElement();
        return target?.matches(':disabled') ? null : target;
    }

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    /**
     * The field's control element, found by `controlId` but scoped to this field's own subtree — a
     * duplicate or consumer-reused id elsewhere on the page can't steal focus/reset. The control
     * registers its id through `setControlId`, so this matches the same element the labels point at.
     */
    private controlElement(): HTMLElement | null {
        const id = this.controlId();
        if (!id) return null;
        return [...this.host.querySelectorAll<HTMLElement>('[id]')].find((element) => element.id === id) ?? null;
    }

    /** @ignore */
    registerStateProvider(provider: RdxFieldState): () => void {
        const registration = { provider };
        this.stateProviders.update((providers) => [...providers, registration]);
        return () => this.stateProviders.update((providers) => providers.filter((entry) => entry !== registration));
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

    private resolveTouched(controlTouched: () => boolean): boolean {
        return this.resolve(
            'touched',
            () => this.touched() ?? (controlTouched() || (this.formContext?.touchedFor(this.effectiveName()) ?? false))
        );
    }

    private resolveDirty(controlDirty: () => boolean): boolean {
        return this.resolve(
            'dirty',
            () => this.dirty() ?? (controlDirty() || (this.formContext?.dirtyFor(this.effectiveName()) ?? false))
        );
    }
}

function injectFieldRoot(): RdxFieldRoot {
    return inject(RdxFieldRoot);
}
