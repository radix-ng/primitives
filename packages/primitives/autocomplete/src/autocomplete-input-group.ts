import { Directive, inject } from '@angular/core';
import { RdxAutocompleteRoot } from './autocomplete-root';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Optional wrapper around the input and its adornments (icon, clear, trigger). Mirrors the input's
 * state via `data-*` so the whole group can be styled together (focus ring, disabled, etc.).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteInputGroup]',
    exportAs: 'rdxAutocompleteInputGroup',
    host: {
        '[attr.data-popup-open]': 'dataAttr(root.open())',
        '[attr.data-disabled]': 'dataAttr(root.disabledState())',
        '[attr.data-required]': 'dataAttr(root.requiredState())',
        '[attr.data-filled]': 'dataAttr(!!root.value())'
    }
})
export class RdxAutocompleteInputGroup {
    protected readonly root = inject(RdxAutocompleteRoot);
    protected readonly dataAttr = attr;
}
