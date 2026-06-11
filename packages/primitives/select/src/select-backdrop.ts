import { Directive } from '@angular/core';
import { injectSelectRootContext } from './select-root';

/**
 * An overlay rendered beneath the popup in `modal` mode. Place it inside the portal/presence; style
 * it `position: fixed; inset: 0`. Exposes `data-open` / `data-closed` for animation.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxSelectBackdrop]',
    exportAs: 'rdxSelectBackdrop',
    host: {
        'aria-hidden': 'true',
        '[attr.data-state]': 'rootContext.open() ? "open" : "closed"',
        '[attr.data-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.open() ? undefined : ""'
    }
})
export class RdxSelectBackdrop {
    protected readonly rootContext = injectSelectRootContext();
}
