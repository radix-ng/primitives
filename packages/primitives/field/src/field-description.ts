import { Directive, effect, input } from '@angular/core';
import { injectFieldRootContext } from './field-root';

let descriptionId = 0;

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
        '[attr.data-invalid]': 'dataAttr(rootContext.invalidState())',
        '[attr.data-disabled]': 'dataAttr(rootContext.disabledState())'
    }
})
export class RdxFieldDescription {
    protected readonly rootContext = injectFieldRootContext()!;

    /**
     * Description id.
     *
     * @group Props
     */
    readonly id = input(`rdx-field-description-${descriptionId++}`);

    constructor() {
        effect((onCleanup) => {
            const id = this.id();
            this.rootContext.addDescriptionId(id);
            onCleanup(() => this.rootContext.removeDescriptionId(id));
        });
    }

    protected readonly dataAttr = attr;
}
