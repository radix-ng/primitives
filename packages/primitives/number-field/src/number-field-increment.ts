import { RdxNumberFieldButton } from './number-field-button';
import { Directive } from '@angular/core';

/**
 * A stepper button that increases the field value when clicked or held.
 *
 * @see https://base-ui.com/react/components/number-field
 */
@Directive({
    selector: 'button[rdxNumberFieldIncrement]',
    exportAs: 'rdxNumberFieldIncrement',
    host: {
        'aria-label': 'Increase'
    }
})
export class RdxNumberFieldIncrement extends RdxNumberFieldButton {
    protected readonly isIncrement = true;
}
