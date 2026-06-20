import { Directive } from '@angular/core';
import { injectComboboxRootContext } from './combobox-root';

/**
 * An overlay rendered beneath the popup in `modal` mode. Place it inside the portal/presence; style
 * it `position: fixed; inset: 0`. Give it `pointer-events: auto` so a click on it dismisses the popup
 * (with `modal`, the rest of the page is inert). Exposes `data-open` / `data-closed` for animation.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxBackdrop]',
    exportAs: 'rdxComboboxBackdrop',
    host: {
        // A decorative overlay — Base UI marks it `role="presentation"` (excluded from the a11y tree).
        role: 'presentation',
        '[attr.data-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.open() ? undefined : ""'
    }
})
export class RdxComboboxBackdrop {
    protected readonly rootContext = injectComboboxRootContext();
}
