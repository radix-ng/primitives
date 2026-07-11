import { Directive, effect, untracked } from '@angular/core';
import { injectNgControlState } from '@radix-ng/primitives/core';
import { injectFieldRootContext, RdxFieldState } from './field-root';

/**
 * Bridges a same-host Reactive Forms or template-driven `NgControl` into an enclosing `rdxFieldRoot`.
 * Place it next to `formControl`, `formControlName`, or `ngModel`; Angular remains the source of value,
 * validation, and interaction state while Field owns when that state is displayed.
 *
 * ```html
 * <div rdxFieldRoot>
 *   <label rdxFieldLabel>Email</label>
 *   <input formControlName="email" rdxFieldControl rdxNgControlField />
 *   <p match="required" rdxFieldError>Email is required.</p>
 * </div>
 * ```
 *
 * The adapter also infers the Field name from `formControlName` / `ngModel` for Form-level server-error
 * routing. An explicit `name` on `rdxFieldRoot` takes precedence (useful for nested or remapped keys).
 *
 * @group Components
 */
@Directive({
    selector: '[formControl][rdxNgControlField], [formControlName][rdxNgControlField], [ngModel][rdxNgControlField]',
    exportAs: 'rdxNgControlField'
})
export class RdxNgControlField {
    private readonly ngControlState = injectNgControlState();
    private readonly fieldContext = injectFieldRootContext();

    /** Normalized Angular validation errors (`{ kind, message? }[]`). */
    readonly validationErrors = this.ngControlState.errors;

    constructor() {
        effect(
            (onCleanup) => {
                if (!this.ngControlState.connected()) {
                    return;
                }

                const state: RdxFieldState = {
                    name: () => this.ngControlState.name(),
                    invalid: () => this.ngControlState.invalid(),
                    pending: () => this.ngControlState.pending(),
                    disabled: () => this.ngControlState.disabled(),
                    dirty: () => this.ngControlState.dirty(),
                    touched: () => this.ngControlState.touched(),
                    errors: () => this.ngControlState.errors()
                };

                // Registration reads the previous provider internally. Keep that bookkeeping outside
                // this effect's dependency graph or replacing the provider would retrigger itself.
                const previous = untracked(() => this.fieldContext.setStateProvider(state));
                onCleanup(() => untracked(() => this.fieldContext.clearStateProvider(state, previous)));
            },
            { debugName: 'RdxNgControlField.connect' }
        );
    }
}
