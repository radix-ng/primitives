import { Directive, effect, input } from '@angular/core';
import { injectFieldRootContext } from './field-root';

let errorId = 0;

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
    readonly id = input(`rdx-field-error-${errorId++}`);

    constructor() {
        effect((onCleanup) => {
            const id = this.id();
            this.rootContext.addErrorId(id);
            onCleanup(() => this.rootContext.removeErrorId(id));
        });
    }

    protected readonly dataAttr = attr;
}
