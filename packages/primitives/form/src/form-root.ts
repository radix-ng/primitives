import {
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    linkedSignal,
    output,
    signal,
    Signal
} from '@angular/core';
import { createContext, RDX_DEFAULT_VALIDATION_MODE, RdxValidationMode } from '@radix-ng/primitives/core';

/** A normalized external-error map: each field name maps to its message(s) in display order. */
export type RdxFormErrors = Record<string, string | string[]>;

/** Payload of {@link RdxFormRoot.onFormSubmit}. Mirrors Base UI's `(values, eventDetails)` shape. */
export interface RdxFormSubmitEvent {
    /** The form's values serialized from `FormData` (repeated names collapse into arrays). */
    values: Record<string, FormDataEntryValue | FormDataEntryValue[]>;
    /** Why the submit happened (Base UI `SubmitEventDetails.reason`). Always `'none'` for a user submit. */
    reason: 'none';
    /** The original native submit event (already `preventDefault`-ed). */
    event: SubmitEvent;
}

/**
 * What a {@link RdxFieldRoot} registers with an enclosing Form. Structural `() =>` accessors keep the
 * Form entry free of any import from `field` (acyclic ng-packagr graph: `field` → `form`).
 */
export interface RdxFormFieldRegistration {
    /** The field's `name` (key external errors match against), or `undefined`. */
    name: () => string | undefined;
    /** The field's **actual** invalid state (ungated, includes external errors) — drives the submit guard
     * and `anyInvalid`. */
    invalid: () => boolean;
    /** The field's **displayed** tri-state validity, gated by its `validationMode` — drives the form's
     * presentation `data-invalid` so it stays neutral on load while its fields are. `null` = neutral. */
    displayValid?: () => boolean | null;
    /** Whether the field is dirty. */
    dirty: () => boolean;
    /** Whether the field is touched. */
    touched: () => boolean;
    /** Focus the field's control (by its `controlId`). */
    focus: () => void;
    /** Reset the field's interaction state (touched/dirty/focused → false, filled re-sync). */
    resetState: () => void;
}

/**
 * External owner of form-level state (e.g. the Signal Forms `[rdxSignalForm]` adapter). Mirrors Field's
 * `RdxFieldState` seam one level up. Each member is optional. The aggregate accessors (`dirty`/`touched`/
 * `submitting`) take over the corresponding form-level state; `invalid` is **merged** with the field
 * registry (so a real registered-field error still counts); the per-name accessors route a field's client
 * state by `name`. Kept as framework-free `() =>` accessors (no `@angular/forms/signals` dependency). See
 * ADR 0004.
 */
export interface RdxFormState {
    invalid?: () => boolean;
    dirty?: () => boolean;
    touched?: () => boolean;
    submitting?: () => boolean;
    /**
     * Optional Angular-owned submission lifecycle. Returning `undefined` keeps the Form's Base UI-style
     * synchronous submit path; returning a Promise delegates this submit to the adapter. Signal Forms
     * uses this only when its opt-in `rdxSignalSubmit` input is present, and calls Angular's public
     * `submit()` API so validation, touched state, concurrency, and submission errors stay Angular-owned.
     */
    submit?: () => Promise<boolean> | undefined;
    /**
     * Per-name **client** validation errors (e.g. `rdxSignalForm`'s Signal Forms name-routing). Surfaced
     * through the Form's `clientErrorsFor` channel and gated by `validationMode` like any client validity.
     * Independent of the Form's `errors` input (server errors), which stays eager.
     */
    errorsFor?: (name: string) => string[];
    /**
     * Per-name `touched` / `dirty` for a name-routed field. Lets a `rdxFieldRoot` that has only a bare
     * `[formField]` control (no `rdxSignalField` / `rdxFieldControl`) still reveal its error on blur under
     * `validationMode="onBlur"`/`"onChange"` — the field reads its interaction state from here.
     */
    touchedFor?: (name: string) => boolean;
    dirtyFor?: (name: string) => boolean;
}

export interface RdxFormRootContext {
    /**
     * **Client** validation errors routed by a form-level provider (e.g. `rdxSignalForm`'s Signal Forms
     * name-routing). These are gated by `validationMode` like any client validity — adding `rdxSignalForm`
     * must not change error-display timing.
     */
    clientErrorsFor: (name: string | undefined) => string[];
    /** **Server/external** errors from the Form's `errors` input. Shown eagerly (not gated). */
    externalErrorsFor: (name: string | undefined) => string[];
    /** Per-name `touched` / `dirty` from a form-level provider (`rdxSignalForm`); `false` when none. */
    touchedFor: (name: string | undefined) => boolean;
    dirtyFor: (name: string | undefined) => boolean;
    notifyEdited: (name: string | undefined) => void;
    /**
     * Whether a submit has been attempted (set before the validity check on submit, cleared on reset).
     * A presentation-timing seam: an adapter can reveal a field's error after a submit attempt without the
     * field having been touched, so the consumer never hand-rolls "mark touched on submit". Base UI's
     * submit-attempt state, kept at the form level.
     */
    submitAttempted: Signal<boolean>;
    /** The form's default validation-display mode; a `rdxFieldRoot` may override it per field. */
    validationMode: Signal<RdxValidationMode>;
    /** Registers a field; returns its unregister callback. */
    register: (field: RdxFormFieldRegistration) => () => void;
    setStateProvider: (provider: RdxFormState | null) => RdxFormState | null;
    /**
     * Identity-checked teardown: roll the slot back to `previous` only if `provider` is still active,
     * so an old adapter's destroy can't clobber a newer one (create-before-destroy on a view swap).
     */
    clearStateProvider: (provider: RdxFormState | null, previous: RdxFormState | null) => void;
    hasStateProvider: Signal<boolean>;
}

const formRootContext = (): RdxFormRootContext => {
    const root = inject(RdxFormRoot);
    return {
        clientErrorsFor: (name: string | undefined) => root.clientErrorsFor(name),
        externalErrorsFor: (name: string | undefined) => root.externalErrorsFor(name),
        touchedFor: (name: string | undefined) => root.touchedFor(name),
        dirtyFor: (name: string | undefined) => root.dirtyFor(name),
        notifyEdited: (name: string | undefined) => root.notifyEdited(name),
        submitAttempted: root.submitAttempted,
        validationMode: root.validationMode,
        register: (field: RdxFormFieldRegistration) => root.register(field),
        setStateProvider: (provider: RdxFormState | null) => root.setStateProvider(provider),
        clearStateProvider: (provider: RdxFormState | null, previous: RdxFormState | null) =>
            root.clearStateProvider(provider, previous),
        hasStateProvider: root.hasStateProvider
    };
};

export const [injectFormRootContext, provideFormRootContext] = createContext<RdxFormRootContext>(
    'RdxFormRoot',
    'components/form'
);

/** Collapses `FormData` into a plain object; repeated names collapse into arrays. */
function serializeFormData(data: FormData): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
    const values: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
    data.forEach((value, key) => {
        // `Object.hasOwn`, not `key in values` — a control named after an Object.prototype member
        // (`toString`, `constructor`, …) must not be misread as a duplicate.
        if (Object.hasOwn(values, key)) {
            const existing = values[key];
            values[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
        } else {
            values[key] = value;
        }
    });
    return values;
}

/**
 * The top of the forms layer cake: a single directive on the native `<form>` element that aggregates
 * field state, maps external (server) errors onto fields by `name`, intercepts submit (values-as-object,
 * focus the first invalid field), and resets field interaction state on native `reset`. It owns no
 * values and runs no validation — Angular form systems (or Field inputs) remain the source of validity.
 *
 * @group Components
 */
@Directive({
    selector: 'form[rdxFormRoot]',
    exportAs: 'rdxFormRoot',
    providers: [provideFormRootContext(formRootContext)],
    host: {
        novalidate: '',
        '[attr.data-invalid]': 'anyDisplayedInvalid() ? "" : undefined',
        '[attr.data-dirty]': 'anyDirty() ? "" : undefined',
        '[attr.data-touched]': 'anyTouched() ? "" : undefined',
        '[attr.data-submitting]': 'submitting() ? "" : undefined',
        '(submit)': 'onSubmit($event)',
        '(reset)': 'onReset()'
    }
})
export class RdxFormRoot {
    private readonly form = inject<ElementRef<HTMLFormElement>>(ElementRef).nativeElement;

    /** External/server validation errors keyed by `Field.Root` `name`. */
    readonly errors = input<RdxFormErrors | null | undefined>();

    /**
     * When fields reveal their validity (error styling + message). The control/adapter always reports the
     * actual state; this decides *when* the Field surfaces it. A `rdxFieldRoot` can override it per field.
     * Server errors (`errors` above) always show regardless. Defaults to `'onBlur'`.
     *
     * @group Props
     * @defaultValue 'onBlur'
     */
    readonly validationMode = input<RdxValidationMode>(RDX_DEFAULT_VALIDATION_MODE);

    /** Emits the remaining error map after a field's external error is cleared by a user edit (or reset). */
    readonly onClearErrors = output<RdxFormErrors>();

    /** Emits the serialized form values when a valid form is submitted. */
    readonly onFormSubmit = output<RdxFormSubmitEvent>();

    private readonly fields = signal<RdxFormFieldRegistration[]>([]);

    private readonly stateProvider = signal<RdxFormState | null>(null);

    /** Whether an external adapter currently owns form-level state. */
    readonly hasStateProvider = computed(() => this.stateProvider() !== null);

    /**
     * Names whose external error has been cleared by a user edit. Reset to empty whenever a new `errors`
     * object reference is assigned — the server just spoke, so everything it said is live again.
     */
    private readonly clearedNames = linkedSignal<RdxFormErrors | null | undefined, Set<string>>({
        source: this.errors,
        computation: () => new Set<string>()
    });

    /** The `errors` input minus cleared names, normalized to `string[]`. */
    private readonly effectiveErrors = computed<Record<string, string[]>>(() => {
        const errors = this.errors() ?? {};
        const cleared = this.clearedNames();
        const result: Record<string, string[]> = {};
        for (const key of Object.keys(errors)) {
            if (cleared.has(key)) {
                continue;
            }
            const value = errors[key];
            result[key] = Array.isArray(value) ? value : [value];
        }
        return result;
    });

    /** **Actual** aggregate invalidity (eager) — drives the submit guard / focus-first-invalid and is the
     * value to read in app logic. Merges a form-level provider with the field registry. */
    readonly anyInvalid = computed(() => this.aggregate('invalid'));
    readonly anyDirty = computed(() => this.aggregate('dirty'));
    readonly anyTouched = computed(() => this.aggregate('touched'));
    readonly submitting = computed(() => this.stateProvider()?.submitting?.() ?? false);

    /**
     * **Displayed** aggregate invalidity — the source for the host `data-invalid` (a presentation
     * attribute). A field counts only once its own `validationMode` reveals it (`displayValid() === false`),
     * so the form stays **neutral on load** while its fields are, instead of leaking the gated state.
     * Distinct from {@link anyInvalid} (actual, eager).
     *
     * When **any** display-aware field is registered, those fields are the *authoritative* displayed
     * source and win outright — a form-level provider's aggregate `invalid()` is **not** added on top
     * (it would contradict a field that overrode its own `validationMode` to stay neutral; and the
     * fields already reflect that provider's per-name state). The provider fallback applies only when no
     * display-aware field carries the state, and then conservatively — under `validationMode="always"`
     * or after a submit attempt, never from `anyTouched`.
     */
    readonly anyDisplayedInvalid = computed(() => {
        const fields = this.fields();
        if (fields.some((field) => field.displayValid?.() === false)) {
            return true;
        }
        if (fields.some((field) => field.displayValid !== undefined)) {
            return false;
        }
        const providerInvalid = this.stateProvider()?.invalid?.() ?? false;
        return providerInvalid && (this.validationMode() === 'always' || this.submitAttempted());
    });

    /**
     * Whether a submit has been attempted on this form, exposed to fields via the context. Set true at the
     * very start of {@link onSubmit} (before the validity check, so a field whose `validationMode` defers
     * display, e.g. `onBlur`, reveals its error in time to block the submit) and cleared on native reset.
     */
    readonly submitAttempted = signal(false);

    /**
     * Resolve a boolean aggregate. For `dirty` / `touched` a registered provider's accessor wins, else OR
     * over the registry. For **`invalid`** the two are **merged** (`provider || registry`): a registered
     * field's actual invalidity — e.g. a server `[errors]` entry — must still count (and block submit) even
     * when a form-level provider (`rdxSignalForm`) reports the client model valid.
     */
    private aggregate(key: 'invalid' | 'dirty' | 'touched'): boolean {
        const accessor = this.stateProvider()?.[key];
        const fromRegistry = this.fields().some((field) => field[key]());
        if (key === 'invalid') {
            return (accessor?.() ?? false) || fromRegistry;
        }
        return accessor ? accessor() : fromRegistry;
    }

    /** Client validation errors from a form-level provider (`rdxSignalForm`); `[]` when none. Gated. */
    clientErrorsFor(name: string | undefined): string[] {
        if (!name) {
            return [];
        }
        return this.stateProvider()?.errorsFor?.(name) ?? [];
    }

    /** Per-name `touched` from a form-level provider (`rdxSignalForm`); `false` when none. */
    touchedFor(name: string | undefined): boolean {
        return name ? (this.stateProvider()?.touchedFor?.(name) ?? false) : false;
    }

    /** Per-name `dirty` from a form-level provider (`rdxSignalForm`); `false` when none. */
    dirtyFor(name: string | undefined): boolean {
        return name ? (this.stateProvider()?.dirtyFor?.(name) ?? false) : false;
    }

    /**
     * Server/external errors from the `errors` input (eager). A separate channel from {@link clientErrorsFor}:
     * the `errors` input always applies, even alongside a form-level client provider (`rdxSignalForm`), so
     * adding `rdxSignalForm` never disables your server errors.
     */
    externalErrorsFor(name: string | undefined): string[] {
        if (!name) {
            return [];
        }
        return this.effectiveErrors()[name] ?? [];
    }

    /** Clears a field's server error (the `errors` input) after a user edit, emitting the remaining map.
     * Client provider errors (`rdxSignalForm`) are not affected — Signal Forms re-validates them itself. */
    notifyEdited(name: string | undefined): void {
        if (!name) {
            return;
        }
        const errors = this.errors() ?? {};
        if (!Object.hasOwn(errors, name) || this.clearedNames().has(name)) {
            return;
        }
        this.clearedNames.update((set) => new Set(set).add(name));
        this.onClearErrors.emit(this.remainingErrors());
    }

    register(field: RdxFormFieldRegistration): () => void {
        this.fields.update((list) => [...list, field]);
        return () => this.fields.update((list) => list.filter((item) => item !== field));
    }

    /** Register (or clear with `null`) an external owner of form-level state; returns the previous one. */
    setStateProvider(provider: RdxFormState | null): RdxFormState | null {
        const previous = this.stateProvider();
        this.stateProvider.set(provider);
        return previous;
    }

    /**
     * Identity-checked teardown — roll back to `previous` only if `provider` is still active, so an
     * old adapter's destroy can't clobber a newer one (create-before-destroy on a view swap).
     */
    clearStateProvider(provider: RdxFormState | null, previous: RdxFormState | null): void {
        if (this.stateProvider() === provider) {
            this.stateProvider.set(previous);
        }
    }

    onSubmit(event: SubmitEvent): void {
        // SPA submits never navigate; never stopPropagation so Reactive Forms `(ngSubmit)` keeps firing.
        event.preventDefault();

        // Record the attempt *before* reading validity. Display-gating uses `submitAttempted` to reveal
        // errors (a `validationMode` of `onBlur`/`onSubmit`), but the Form aggregates *actual* invalidity,
        // so a pristine invalid form is blocked and its errors revealed instead of submitting.
        this.submitAttempted.set(true);

        // Preserve form-system-agnostic invalidity (notably `errors`) before handing control to an
        // adapter. If the provider itself is invalid, let its submit lifecycle mark fields touched and
        // run its own invalid callback; this early guard is only for invalidity outside that provider.
        const stateProvider = this.stateProvider();
        const hasRegistryOnlyInvalidity =
            stateProvider !== null &&
            stateProvider.submit !== undefined &&
            !(stateProvider.invalid?.() ?? false) &&
            this.fields().some((field) => field.invalid());
        if (hasRegistryOnlyInvalidity) {
            this.focusFirstInvalidField();
            return;
        }

        // Angular-specific adapters may own the asynchronous submission lifecycle. This is opt-in: an
        // adapter returns `undefined` to retain the Base UI-style path below. A delegated submit owns the
        // action and therefore does not also emit `onFormSubmit` (which would run user side effects twice).
        const delegatedSubmit = stateProvider?.submit?.();
        if (delegatedSubmit) {
            void this.finishDelegatedSubmit(delegatedSubmit);
            return;
        }

        if (this.aggregate('invalid')) {
            this.focusFirstInvalidField();
            return;
        }

        const values = serializeFormData(new FormData(this.form));
        this.onFormSubmit.emit({ values, reason: 'none', event });
    }

    private async finishDelegatedSubmit(submission: Promise<boolean>): Promise<void> {
        const succeeded = await submission;
        if (!succeeded) {
            // Matches Base UI Form: a blocked/failed submit focuses the first invalid registered field.
            // Angular owns when the result becomes invalid (including returned submission errors).
            this.focusFirstInvalidField();
        }
    }

    private focusFirstInvalidField(): void {
        // Registry order is DOM order; provider-only invalidity has no registered control to focus.
        this.fields()
            .find((field) => field.invalid())
            ?.focus();
    }

    onReset(): void {
        // Don't prevent the native reset — control values revert on their own.
        this.submitAttempted.set(false);
        // Clear server errors (the `errors` input); client provider errors re-validate themselves.
        const keys = Object.keys(this.errors() ?? {});
        const hadVisible = keys.some((key) => !this.clearedNames().has(key));
        if (keys.length) {
            this.clearedNames.set(new Set(keys));
        }
        if (hadVisible) {
            this.onClearErrors.emit({});
        }
        // Values revert asynchronously relative to the reset event — re-sync field state next macrotask.
        // Read the registry fresh inside the callback (fields may register/unregister in between), and
        // cancel on destroy so resetState never runs against a torn-down field.
        const timer = setTimeout(() => {
            this.resetTimers.delete(timer);
            this.fields().forEach((field) => field.resetState());
        });
        this.resetTimers.add(timer);
    }

    private readonly resetTimers = new Set<ReturnType<typeof setTimeout>>();

    constructor() {
        inject(DestroyRef).onDestroy(() => this.resetTimers.forEach((timer) => clearTimeout(timer)));
    }

    private remainingErrors(): RdxFormErrors {
        const errors = this.errors() ?? {};
        const cleared = this.clearedNames();
        const result: RdxFormErrors = {};
        for (const key of Object.keys(errors)) {
            if (!cleared.has(key)) {
                result[key] = errors[key];
            }
        }
        return result;
    }
}
