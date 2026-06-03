import { RdxNumberFieldButton } from './number-field-button';
import { Directive } from '@angular/core';

/**
 * A stepper button that decreases the field value when clicked or held.
 *
 * @see https://base-ui.com/react/components/number-field
 */
@Directive({
    selector: 'button[rdxNumberFieldDecrement]',
    exportAs: 'rdxNumberFieldDecrement',
    host: {
        'aria-label': 'Decrease'
    }
})
export class RdxNumberFieldDecrement extends RdxNumberFieldButton {
    protected readonly isIncrement = false;
}
