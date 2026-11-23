import { Directive, input } from '@angular/core';
import { injectId, watch } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from './field-root';
import { fieldStateAttributes } from './field-state-attributes';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Describes the field control.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxFieldDescription]',
    exportAs: 'rdxFieldDescription',
    host: {
        '[attr.id]': 'id()',
        ...fieldStateAttributes
    }
})
export class RdxFieldDescription {
    protected readonly rootContext = injectFieldRootContext();

    /**
     * Description id.
     *
     * @group Props
     */
    readonly id = input(injectId('rdx-field-description-'));

    constructor() {
        watch([this.id], ([id], onCleanup) => {
            onCleanup(this.rootContext.registerDescription(id));
        });
    }

    protected readonly dataAttr = attr;
}
