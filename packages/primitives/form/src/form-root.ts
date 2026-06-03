import {
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    linkedSignal,
    output,
    Signal,
    signal
} from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

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
    /** The field's merged invalid state (includes external errors). */
    invalid: () => boolean;
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
 * External owner of form-level state (e.g. a future Signal Forms `[rdxSignalForm]` adapter). Mirrors
 * Field's `RdxFieldState` seam one level up. Each member is optional: a provided accessor wins over the
 * built-in registry/`errors`-input behavior; absent accessors leave the built-in behavior untouched.
 * Kept as framework-free `() =>` accessors (no `@angular/forms/signals` dependency). See ADR 0004.
 */
export interface RdxFormState {
    invalid?: () => boolean;
    dirty?: () => boolean;
    touched?: () => boolean;
    submitting?: () => boolean;
    /** Per-name external error source; while provided, the `errors` input + clear-on-edit are inert. */
    errorsFor?: (name: string) => string[];
}

export interface RdxFormRootContext {
    errorsFor: (name: string | undefined) => string[];
    notifyEdited: (name: string | undefined) => void;
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
        errorsFor: (name: string | undefined) => root.errorsFor(name),
        notifyEdited: (name: string | undefined) => root.notifyEdited(name),
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
        '[attr.data-invalid]': 'anyInvalid() ? "" : undefined',
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

    readonly anyInvalid = computed(() => this.aggregate('invalid'));
    readonly anyDirty = computed(() => this.aggregate('dirty'));
    readonly anyTouched = computed(() => this.aggregate('touched'));
    readonly submitting = computed(() => this.stateProvider()?.submitting?.() ?? false);

    /** Resolve a boolean aggregate: a registered provider's accessor wins, else OR over the registry. */
    private aggregate(key: 'invalid' | 'dirty' | 'touched'): boolean {
        const accessor = this.stateProvider()?.[key];
        return accessor ? accessor() : this.fields().some((field) => field[key]());
    }

    /** Resolves the external messages for a field name (provider source wins over the `errors` input). */
    errorsFor(name: string | undefined): string[] {
        if (!name) {
            return [];
        }
        const provider = this.stateProvider();
        if (provider?.errorsFor) {
            return provider.errorsFor(name);
        }
        return this.effectiveErrors()[name] ?? [];
    }

    /** Clears a field's external error after a user edit, emitting the remaining map. */
    notifyEdited(name: string | undefined): void {
        if (!name) {
            return;
        }
        // While a provider owns errors, Signal Forms clears/reapplies them itself — stay inert.
        if (this.stateProvider()?.errorsFor) {
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

        if (this.aggregate('invalid')) {
            // Focus the first invalid registered field (DOM order); provider-only invalid has none to focus.
            this.fields()
                .find((field) => field.invalid())
                ?.focus();
            return;
        }

        const values = serializeFormData(new FormData(this.form));
        this.onFormSubmit.emit({ values, reason: 'none', event });
    }

    onReset(): void {
        // Don't prevent the native reset — control values revert on their own.
        if (!this.stateProvider()?.errorsFor) {
            const keys = Object.keys(this.errors() ?? {});
            const hadVisible = keys.some((key) => !this.clearedNames().has(key));
            if (keys.length) {
                this.clearedNames.set(new Set(keys));
            }
            if (hadVisible) {
                this.onClearErrors.emit({});
            }
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
