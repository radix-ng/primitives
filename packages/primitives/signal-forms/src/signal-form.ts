import { booleanAttribute, DestroyRef, Directive, inject, input } from '@angular/core';
import { submit, type FieldTree } from '@angular/forms/signals';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectFormRootContext, RdxFormState } from '@radix-ng/primitives/form';

/** A Signal Forms subfield read structurally — callable to its state (`errors()` / `touched()` / `dirty()`). */
type NamedField = () => {
    errors: () => readonly { kind: string; message?: string }[];
    touched: () => boolean;
    dirty: () => boolean;
};

/**
 * Bridges an Angular **Signal Forms** form into an enclosing `form[rdxFormRoot]`.
 *
 * ```html
 * <form rdxFormRoot [rdxSignalForm]="loginForm">
 *   <!-- fields bound with [formField] (+ rdxSignalField) -->
 * </form>
 * ```
 *
 * Registers an {@link RdxFormState} provider so the Form's aggregate `data-invalid` / `data-dirty` /
 * `data-touched` / `data-submitting` attributes and the submit guard read authoritative Signal Forms
 * state. By default this adapter owns only client-side state and `name`-routing; server errors stay a
 * separate eager channel applied through `rdxFormRoot[errors]`. Add `rdxSignalSubmit` to delegate native
 * submission to Signal Forms' own `submit()` lifecycle instead of `rdxFormRoot.onFormSubmit`:
 *
 * ```html
 * <form rdxFormRoot [rdxSignalForm]="loginForm" rdxSignalSubmit>…</form>
 * ```
 *
 * `errorsFor(name)` routes a field's errors to a `rdxFieldRoot` by its `name`, walking the `FieldTree`
 * so dotted paths into nested object/array fields resolve too (`address.street`, `items.0.name`). A
 * field can surface messages from the form alone — no per-field `rdxSignalField` needed for errors.
 * These are the **two modes** (per-field adapter vs form-level name routing) — prefer one per field; if
 * a field carries both, `rdxFieldError.messages()` deduplicates by text so the shared message is not
 * shown twice.
 *
 * See ADR 0018 and ADR 0020.
 *
 * @group Components
 */
@Directive({
    selector: 'form[rdxFormRoot][rdxSignalForm]',
    exportAs: 'rdxSignalForm'
})
export class RdxSignalForm {
    /** The Signal Forms root field (from `form(...)`) whose aggregate state drives the enclosing Form. */
    readonly form = input.required<FieldTree<unknown>>({ alias: 'rdxSignalForm' });

    /**
     * Delegate native submission to Angular Signal Forms' `submit()` lifecycle. Opt-in so adding the
     * state adapter to an existing 1.x form cannot silently replace its `(onFormSubmit)` side effects.
     * The bound `form()` must define `submission.action`; Angular reports a descriptive error otherwise.
     *
     * @group Props
     * @defaultValue false
     */
    readonly signalSubmit = input<boolean, BooleanInput>(false, {
        alias: 'rdxSignalSubmit',
        transform: booleanAttribute
    });

    private readonly formContext = injectFormRootContext();

    constructor() {
        const state: RdxFormState = {
            invalid: () => this.state().invalid(),
            dirty: () => this.state().dirty(),
            touched: () => this.state().touched(),
            submitting: () => this.state().submitting(),
            submit: () => (this.signalSubmit() ? submit(this.form()) : undefined),
            errorsFor: (name) => this.errorsFor(name),
            // Per-name interaction state so a name-routed field (bare `[formField]`, no `rdxSignalField`)
            // can reveal its error on blur/change under `validationMode="onBlur"`/`"onChange"`.
            touchedFor: (name) => this.fieldState(name)?.touched() ?? false,
            dirtyFor: (name) => this.fieldState(name)?.dirty() ?? false
        };

        const previous = this.formContext.setStateProvider(state);
        // Identity-checked teardown: only roll back if our provider is still active, so a newer adapter
        // mounted during a view swap (create-before-destroy) is not clobbered by this destroy.
        inject(DestroyRef).onDestroy(() => this.formContext.clearStateProvider(state, previous));
    }

    /**
     * Messages for the field at the dotted `name` path (`message ?? kind` per error). Walks the
     * `FieldTree` so nested object/array fields resolve too — e.g. `address.street`, `items.0.name`.
     */
    private errorsFor(name: string): string[] {
        return (
            this.fieldState(name)
                ?.errors()
                .map((error) => error.message ?? error.kind) ?? []
        );
    }

    /**
     * The Signal Forms field *state* at the dotted `name` path, or `null` if it doesn't resolve. Walks the
     * `FieldTree` so nested object/array fields work (`address.street`, `items.0.name`).
     */
    private fieldState(name: string): ReturnType<NamedField> | null {
        let node: unknown = this.form();
        for (const segment of name.split('.')) {
            if (node == null || (typeof node !== 'object' && typeof node !== 'function')) {
                return null;
            }
            // Only walk into own properties: a `FieldTree` exposes its subfields as own keys, so a
            // segment that is not one (`constructor`, `__proto__`, `toString`, …) is not a real field.
            // Reading it would resolve to an inherited member — and a function one would then be called
            // below — so reject it instead.
            if (!Object.hasOwn(node, segment)) {
                return null;
            }
            node = (node as Record<string, unknown>)[segment];
        }
        return typeof node === 'function' ? (node as NamedField)() : null;
    }

    /** The current Signal Forms root field state (a `FieldTree` is callable). */
    private state() {
        return this.form()();
    }
}
