import { DestroyRef, ElementRef, Signal } from '@angular/core';
import { RdxPopoverRootDirective } from '../../src/tooltip-root.directive';
import { injectRdxCdkEventService } from '../../src/utils/cdk-event.service';

export interface IIgnoreClickOutsideContainer {
    onOverlayEscapeKeyDownDisabled: Signal<boolean>;
    onOverlayOutsideClickDisabled: Signal<boolean>;
    elementRef: ElementRef<Element>;
    destroyRef: DestroyRef;
    rootDirectives: Signal<ReadonlyArray<RdxPopoverRootDirective>>;
    document: Document;
    rdxCdkEventService: ReturnType<typeof injectRdxCdkEventService>;
}

export interface IArrowDimensions {
    arrowWidth: Signal<number | undefined>;
    arrowHeight: Signal<number | undefined>;
}

export type Message = { value: string; timeFromPrev: number };
