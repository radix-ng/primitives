import { Directive, input } from '@angular/core';
import { injectId, useLabel } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from './field-root';
import { fieldStateAttributes } from './field-state-attributes';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Labels the field control.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxFieldLabel]',
    exportAs: 'rdxFieldLabel',
    host: {
        '[attr.id]': 'id()',
        '[attr.for]': 'htmlFor()',
        '(mousedown)': 'label.onMouseDown($event)',
        '(pointerdown)': 'label.onPointerDown($event)',
        '(click)': 'label.onClick($event)',
        ...fieldStateAttributes,
        '[attr.data-required]': 'dataAttr(rootContext.requiredState())'
    }
})
export class RdxFieldLabel {
    protected readonly rootContext = injectFieldRootContext();

    /**
     * Label id.
     *
     * @group Props
     */
    readonly id = input(injectId('rdx-field-label-'));

    /** Authored control ID. Defaults to the currently registered Field Control. */
    readonly authoredFor = input<string | null>(undefined, { alias: 'for' });

    protected readonly label = useLabel({
        id: this.id,
        controlId: () => {
            const explicit = this.authoredFor();
            return explicit === undefined ? this.rootContext.controlId() || undefined : (explicit ?? undefined);
        },
        registries: [this.rootContext]
    });

    readonly htmlFor = this.label.htmlFor;

    protected readonly dataAttr = attr;
}
