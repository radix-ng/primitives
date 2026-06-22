import { DestroyRef, Directive, inject, input } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { injectFormRootContext, RdxFormState } from '@radix-ng/primitives/form';

/** A Signal Forms subfield read structurally — callable to its state, which exposes `errors()`. */
type NamedField = () => { errors: () => readonly { kind: string; message?: string }[] };

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
 * state. Signal Forms' own `submit()` owns the submit lifecycle and server-error application.
 *
 * `errorsFor(name)` routes a field's errors to a `rdxFieldRoot` by its `name`, walking the `FieldTree`
 * so dotted paths into nested object/array fields resolve too (`address.street`, `items.0.name`). A
 * field can surface messages from the form alone — no per-field `rdxSignalField` needed for errors.
 * These are the **two modes** (per-field adapter vs form-level name routing) — prefer one per field; if
 * a field carries both, `rdxFieldError.messages()` deduplicates by text so the shared message is not
 * shown twice.
 *
 * See ADR 0018.
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

    private readonly formContext = injectFormRootContext();

    constructor() {
        const state: RdxFormState = {
            invalid: () => this.state().invalid(),
            dirty: () => this.state().dirty(),
            touched: () => this.state().touched(),
            submitting: () => this.state().submitting(),
            errorsFor: (name) => this.errorsFor(name)
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
        let node: unknown = this.form();
        for (const segment of name.split('.')) {
            if (node == null) {
                return [];
            }
            node = (node as Record<string, unknown>)[segment];
        }
        if (typeof node !== 'function') {
            return [];
        }
        return (node as NamedField)()
            .errors()
            .map((error) => error.message ?? error.kind);
    }

    /** The current Signal Forms root field state (a `FieldTree` is callable). */
    private state() {
        return this.form()();
    }
}
