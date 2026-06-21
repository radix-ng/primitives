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
 * `errorsFor(name)` routes a field's errors to a `rdxFieldRoot` by its `name` (top-level fields), so a
 * field can surface messages from the form alone — no per-field `rdxSignalField` needed for errors. If a
 * field *also* carries `rdxSignalField`, its errors already come from there; don't rely on both for the
 * same field or messages duplicate.
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
        inject(DestroyRef).onDestroy(() => this.formContext.setStateProvider(previous));
    }

    /** Messages for the top-level field whose key is `name` (`message ?? kind` per error). */
    private errorsFor(name: string): string[] {
        const tree = this.form() as unknown as Record<string, NamedField | undefined>;
        const field = tree[name];
        if (typeof field !== 'function') {
            return [];
        }
        return field()
            .errors()
            .map((error) => error.message ?? error.kind);
    }

    /** The current Signal Forms root field state (a `FieldTree` is callable). */
    private state() {
        return this.form()();
    }
}
