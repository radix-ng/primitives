import { injectFieldRootContext } from './field-root';
import { Directive, effect, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';

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
        '[attr.hidden]': 'rootContext.invalidState() ? undefined : ""',
        '[attr.aria-live]': '"polite"',
        '[attr.data-invalid]': 'dataAttr(rootContext.invalidState())',
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
     * The field's external messages (state provider's, then enclosing Form's), `[]` when none. Render
     * them explicitly via the `exportAs` reference — the directive never injects text content itself:
     * `<p rdxFieldError #err="rdxFieldError">{{ err.messages().join(' ') }}</p>`.
     */
    readonly messages = this.rootContext.messages;

    constructor() {
        effect((onCleanup) => {
            const id = this.id();
            this.rootContext.addErrorId(id);
            onCleanup(() => this.rootContext.removeErrorId(id));
        });
    }

    protected readonly dataAttr = attr;
}
