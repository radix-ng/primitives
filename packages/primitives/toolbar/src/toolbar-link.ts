import { Directive } from '@angular/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { injectToolbarRootContext } from './toolbar-context';

/**
 * A link within a toolbar.
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: '[rdxToolbarLink]',
    exportAs: 'rdxToolbarLink',
    hostDirectives: [RdxRovingFocusItemDirective],
    host: {
        '[attr.data-orientation]': 'rootContext.orientation()',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class RdxToolbarLink {
    protected readonly rootContext = injectToolbarRootContext();

    /** @ignore Space activates a link, matching native button behavior in a toolbar. */
    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key === ' ') {
            event.preventDefault();
            (event.currentTarget as HTMLElement)?.click();
        }
    }
}
