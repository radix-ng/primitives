import { Directive } from '@angular/core';
import { RdxComboboxSeparator } from '@radix-ng/primitives/combobox';

/**
 * A visual separator between groups of suggestions (`role="separator"`). Reuses the combobox separator.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteSeparator]',
    exportAs: 'rdxAutocompleteSeparator',
    hostDirectives: [RdxComboboxSeparator]
})
export class RdxAutocompleteSeparator {}
