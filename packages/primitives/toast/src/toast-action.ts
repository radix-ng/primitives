import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';
import { provideRdxButtonConfig, RdxButtonDirective } from '@radix-ng/primitives/button';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectRdxToastRootContext } from './toast-root';

/**
 * An action button inside a toast (e.g. "Undo"). Unlike {@link RdxToastClose} it does not dismiss
 * on its own — wire your handler with `(click)` and call `close()` from the exposed context when
 * the action should also close the toast.
 */
@Directive({
    selector: '[rdxToastAction]',
    exportAs: 'rdxToastAction',
    hostDirectives: [{ directive: RdxButtonDirective, inputs: ['type', 'role', 'tabIndex'] }],
    providers: [
        provideRdxButtonConfig(() => ({
            disabled: inject(RdxToastAction).disabled,
            focusableWhenDisabled: computed(() => false)
        }))
    ],
    host: {
        '[attr.data-type]': 'rootContext.toast().type'
    }
})
export class RdxToastAction {
    /** Whether the action is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** The toast root context, so handlers can read the toast or dismiss it after acting. */
    readonly rootContext = injectRdxToastRootContext();
}
