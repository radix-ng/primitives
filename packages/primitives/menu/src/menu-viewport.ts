import { Directive } from '@angular/core';
import { usePopupViewport } from '@radix-ng/primitives/core';
import { injectRdxMenuRootContext } from './menu-root';

/**
 * Measures Menu content and preserves a visual snapshot while switching triggers.
 * Use one direct content wrapper for directional transitions; its live Angular view stays interactive.
 * Popup receives --popup-width/--popup-height, and the viewport exposes its content size.
 */
@Directive({
    selector: '[rdxMenuViewport]',
    exportAs: 'rdxMenuViewport',
    host: {
        '[attr.data-activation-direction]': 'viewport.activationDirection()',
        '[attr.data-instant]': 'rootContext.instantType()',
        '[attr.data-transitioning]': 'viewport.transitioning() ? "" : undefined',
        '[style.--popup-width.px]': 'viewport.width()',
        '[style.--popup-height.px]': 'viewport.height()'
    }
})
export class RdxMenuViewport {
    protected readonly rootContext = injectRdxMenuRootContext();
    protected readonly viewport = usePopupViewport({
        popup: () => this.rootContext.popupElement(),
        open: () => this.rootContext.isOpen(),
        register: (notify) => this.rootContext.registerViewport(notify)
    });
}
