import { computed, Directive, effect, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from './field-root';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Describes an invalid field control.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxFieldError]',
    exportAs: 'rdxFieldError',
    host: {
        '[attr.id]': 'id()',
        '[attr.hidden]': 'visible() ? undefined : ""',
        '[attr.aria-live]': '"polite"',
        '[attr.data-invalid]': 'dataAttr(visible() && rootContext.invalidState())',
        '[attr.data-disabled]': 'dataAttr(rootContext.disabledState())'
    }
})
export class RdxFieldError {
    protected readonly rootContext = injectFieldRootContext();

    /**
     * Error message id.
     *
     * @group Props
     */
    readonly id = input(injectId('rdx-field-error-'));

    /**
     * Shows this error only for a matching validation-error key. Bind `true` to keep it visible under
     * external control; omit it for the field's default error behavior.
     *
     * @group Props
     */
    readonly match = input<boolean | string>();

    /** Whether this error part is currently presented. */
    readonly visible = computed(() => {
        const match = this.match();
        if (match === true) {
            return true;
        }
        if (typeof match === 'string') {
            return this.rootContext.matchesError(match);
        }
        return this.rootContext.invalidState();
    });

    /**
     * The field's validation messages — client (provider / form name-routing, once `validationMode`
     * reveals them) then server (the Form's `errors` input, always); `[]` when none. Render them
     * explicitly via the `exportAs` reference — the directive never injects text content itself:
     * `<p rdxFieldError #err="rdxFieldError">{{ err.messages().join(' ') }}</p>`.
     */
    readonly messages = this.rootContext.messages;

    constructor() {
        effect((onCleanup) => {
            const id = this.id();
            if (!this.visible()) {
                return;
            }
            this.rootContext.addErrorId(id);
            onCleanup(() => this.rootContext.removeErrorId(id));
        });
    }

    protected readonly dataAttr = attr;
}
