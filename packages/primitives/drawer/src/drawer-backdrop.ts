import { Directive } from '@angular/core';
import { RdxDialogBackdrop } from '@radix-ng/primitives/dialog';
import { injectRdxDrawerRootContext } from './drawer-root';

/**
 * An overlay displayed beneath the drawer popup.
 *
 * Composes the dialog backdrop and additionally exposes `--drawer-swipe-progress` (0..1) so the
 * consumer can fade it in step with the dismiss gesture.
 */
@Directive({
    selector: '[rdxDrawerBackdrop]',
    exportAs: 'rdxDrawerBackdrop',
    hostDirectives: [RdxDialogBackdrop],
    host: {
        '[style.--drawer-swipe-progress]': 'drawerContext.swipeProgress()',
        '[attr.data-nested-drawer-open]': 'drawerContext.nestedDrawerOpen() ? "" : undefined'
    }
})
export class RdxDrawerBackdrop {
    protected readonly drawerContext = injectRdxDrawerRootContext()!;
}
