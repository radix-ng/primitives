import { Directive } from '@angular/core';
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';

/**
 * A separator between toolbar items or groups.
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: '[rdxToolbarSeparator]',
    exportAs: 'rdxToolbarSeparator',
    hostDirectives: [{ directive: RdxSeparatorRootDirective, inputs: ['orientation'] }]
})
export class RdxToolbarSeparator {}
