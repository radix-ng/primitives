import { Directive } from '@angular/core';
import { injectRdxMenuRootContext } from './menu-root';

/**
 * An optional overlay rendered behind the menu popup.
 * Style it with `position: fixed; inset: 0` and use `data-open` / `data-closed`
 * for CSS animations.
 */
@Directive({
    selector: '[rdxMenuBackdrop]',
    exportAs: 'rdxMenuBackdrop',
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined'
    }
})
export class RdxMenuBackdrop {
    protected readonly rootContext = injectRdxMenuRootContext();
}
