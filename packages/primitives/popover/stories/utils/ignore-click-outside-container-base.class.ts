import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, Directive, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { RdxPopoverRootDirective } from '../../src/popover-root.directive';
import { injectRdxCdkEventService } from '../../src/utils/cdk-event.service';
import { deregisterContainer, registerContainer, setRdxCdkEventService } from './containers.registry';
import { IIgnoreClickOutsideContainer } from './types';

@Directive()
export abstract class IgnoreClickOutsideContainerBase implements IIgnoreClickOutsideContainer {
    onOverlayEscapeKeyDownDisabled = signal(false);
    onOverlayOutsideClickDisabled = signal(false);

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly destroyRef = inject(DestroyRef);
    readonly rootDirectives = viewChildren(RdxPopoverRootDirective);
    readonly document = inject(DOCUMENT);
    readonly rdxCdkEventService = injectRdxCdkEventService();

    protected constructor() {
        afterNextRender(() => {
            this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.container').forEach((container) => {
                const popoverRootInsideContainer = this.rootDirectives().find((popoverRoot) =>
                    container.contains(popoverRoot.popoverTriggerDirective().elementRef.nativeElement)
                );
                if (popoverRootInsideContainer) {
                    setRdxCdkEventService(this.rdxCdkEventService);
                    registerContainer(container, popoverRootInsideContainer);
                    this.destroyRef.onDestroy(() => deregisterContainer(container));
                }
            });
        });
    }
}
