import { DestroyRef, Directive, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { injectFieldRootContext, RdxFieldState } from '@radix-ng/primitives/field';

/**
 * Bridges an Angular **Signal Forms** field into an enclosing `rdxFieldRoot` — with **no duplicate
 * binding**. Place it on the control that already carries `[formField]`; it reads the bound field's
 * state from that directive, so the field expression is written exactly once:
 *
 * ```html
 * <div rdxFieldRoot>
 *   <label rdxFieldLabel>Email</label>
 *   <input rdxInput [formField]="loginForm.email" rdxSignalField />
 *   <p rdxFieldError>Email is required.</p>
 * </div>
 * ```
 *
 * It owns no model and runs no validation — Signal Forms remains the source of truth. It only registers
 * an {@link RdxFieldState} provider on the ancestor Field context so the field's `invalid` / `disabled` /
 * `required` / `dirty` / `touched` data-attributes and the error *content* (`rdxFieldError.messages()`)
 * read authoritative Signal Forms state. `filled` / `focused` stay on Field's DOM heuristic (partial
 * ownership — the seam supports it).
 *
 * See ADR 0018.
 *
 * @group Components
 */
@Directive({
    selector: '[formField][rdxSignalField]',
    exportAs: 'rdxSignalField'
})
export class RdxSignalField {
    /** The co-located `[formField]` directive — the single source of the bound field's state. */
    private readonly formField = inject(FormField);
    private readonly fieldContext = injectFieldRootContext();

    constructor() {
        // The accessors are evaluated lazily by Field's `*State` computeds during change detection
        // (after the `[formField]` binding resolves), so reading `state()` inside these closures is safe.
        const state: RdxFieldState = {
            invalid: () => this.state().invalid(),
            disabled: () => this.state().disabled(),
            required: () => this.state().required(),
            dirty: () => this.state().dirty(),
            touched: () => this.state().touched(),
            errors: () =>
                this.state()
                    .errors()
                    .map((error) => ({ kind: error.kind, message: error.message }))
        };

        const previous = this.fieldContext.setStateProvider(state);
        // Identity-checked teardown: only roll back if our provider is still active, so a newer adapter
        // mounted during a view swap (create-before-destroy) is not clobbered by this destroy.
        inject(DestroyRef).onDestroy(() => this.fieldContext.clearStateProvider(state, previous));
    }

    /** Current Signal Forms field state, read from the co-located `[formField]` directive. */
    private state() {
        return this.formField.state();
    }
}
