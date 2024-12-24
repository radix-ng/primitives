import { DestroyRef, ElementRef, Signal } from '@angular/core';
import { RdxPopoverRootDirective } from '../../src/popover-root.directive';
import { injectRdxCdkEventService } from '../../src/utils/cdk-event.service';

export interface IIgnoreClickOutsideContainer {
    elementRef: ElementRef<Element>;
    destroyRef: DestroyRef;
    rootDirectives: Signal<ReadonlyArray<RdxPopoverRootDirective>>;
    document: Document;
    rdxCdkEventService: ReturnType<typeof injectRdxCdkEventService>;
}

export type Message = { value: string; timeFromPrev: number };
