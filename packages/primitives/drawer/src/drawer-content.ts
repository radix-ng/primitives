import { Directive } from '@angular/core';

/**
 * The scrollable body of the drawer.
 *
 * A structural marker so the anatomy matches Base UI. The popup's swipe engine yields to scrolling
 * inside this region automatically (it only starts a dismiss gesture when the scroll is at its
 * edge), so no extra wiring is needed. Opt individual elements out of swiping with the
 * `data-base-ui-swipe-ignore` attribute.
 */
@Directive({
    selector: '[rdxDrawerContent]',
    exportAs: 'rdxDrawerContent'
})
export class RdxDrawerContent {}
