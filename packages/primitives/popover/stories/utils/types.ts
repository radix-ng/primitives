import { DestroyRef, ElementRef, Signal } from '@angular/core';
import { RdxPopoverRootDirective } from '../../src/popover-root.directive';

export interface IIgnoreClickOutsideContainer {
    elementRef: ElementRef<Element>;
    destroyRef: DestroyRef;
    rootDirectives: Signal<ReadonlyArray<RdxPopoverRootDirective>>;
    document: Document;
}
