import { Directive } from '@angular/core';

/**
 * A label for a menu group.
 */
@Directive({
    selector: '[rdxMenuGroupLabel]',
    exportAs: 'rdxMenuGroupLabel'
})
export class RdxMenuGroupLabel {}
