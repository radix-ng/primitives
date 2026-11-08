import { computed, Directive } from '@angular/core';
import { useLabel } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from '@radix-ng/primitives/field';
import { injectSelectRootContext } from './select-root';

/** An accessible label automatically associated with the select trigger. */
@Directive({
    selector: '[rdxSelectLabel]',
    exportAs: 'rdxSelectLabel',
    host: {
        '[attr.id]': 'id()',
        '[attr.for]': 'label.htmlFor()',
        '[attr.data-invalid]': 'field?.validState() === false ? "" : undefined',
        '[attr.data-valid]': 'field?.validState() === true ? "" : undefined',
        '[attr.data-disabled]': 'field?.disabledState() ? "" : undefined',
        '[attr.data-required]': 'field?.requiredState() ? "" : undefined',
        '[attr.data-touched]': 'field?.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'field?.dirtyState() ? "" : undefined',
        '[attr.data-filled]': 'field?.filledState() ? "" : undefined',
        '[attr.data-focused]': 'field?.focusedState() ? "" : undefined',
        '(mousedown)': 'label.onMouseDown($event)',
        '(pointerdown)': 'label.onPointerDown($event)',
        '(click)': 'label.onClick($event)'
    }
})
export class RdxSelectLabel {
    private readonly root = injectSelectRootContext();
    protected readonly field = injectFieldRootContext(true);
    /** Derived from Root's id, matching Base UI. Set id on Root to customize it. */
    readonly id = computed(() => `${this.root.id()}-label`);
    protected readonly label = useLabel({
        id: this.id,
        controlId: () => this.root.triggerId() ?? this.root.id(),
        control: this.root.triggerElement,
        registries: this.field ? [this.root, this.field] : [this.root]
    });
}
