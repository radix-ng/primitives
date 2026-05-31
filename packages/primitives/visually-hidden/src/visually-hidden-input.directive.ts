import { Directive } from '@angular/core';
import { RdxVisuallyHiddenInputBubbleDirective } from './visually-hidden-input-bubble.directive';

/**
 * Mirrors a control's value into a visually hidden `<input>` so it participates in form
 * submission while staying out of the visual and (when `fully-hidden`) accessibility tree.
 *
 * Apply it to a real `<input>` element. It carries a **single scalar value** — the composed
 * {@link RdxVisuallyHiddenInputBubbleDirective} owns `name`/`value`/`checked` and keeps the
 * native value in sync, re-dispatching `input`/`change` events so the value bubbles to the form.
 *
 * A single `<input>` can only represent one form field, so object/array values are not
 * supported here; render one directive per field instead.
 *
 * @example
 * ```html
 * <input rdxVisuallyHiddenInput [name]="'agree'" [value]="checked() ? 'on' : 'off'" />
 * ```
 */
@Directive({
    selector: 'input[rdxVisuallyHiddenInput]',
    hostDirectives: [
        {
            directive: RdxVisuallyHiddenInputBubbleDirective,
            inputs: ['feature', 'name', 'value', 'checked', 'required', 'disabled']
        }
    ]
})
export class RdxVisuallyHiddenInputDirective {}
