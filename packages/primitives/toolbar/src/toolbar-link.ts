import { injectToolbarRootContext } from './toolbar-context';
import { Directive, inject } from '@angular/core';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';

const TOOLBAR_LINK_METADATA = {
    disabled: false,
    focusableWhenDisabled: true
};

/**
 * A link within a toolbar.
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: '[rdxToolbarLink]',
    exportAs: 'rdxToolbarLink',
    hostDirectives: [RdxCompositeItem],
    host: {
        '[attr.data-orientation]': 'rootContext.orientation()'
    }
})
export class RdxToolbarLink {
    protected readonly rootContext = injectToolbarRootContext();
    private readonly compositeItem = inject(RdxCompositeItem, { self: true });

    constructor() {
        this.compositeItem.setMetadata(TOOLBAR_LINK_METADATA);
    }
}
