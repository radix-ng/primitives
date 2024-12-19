import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, Directive, ElementRef, inject, viewChildren } from '@angular/core';
import { RdxPopoverRootDirective } from '../../src/popover-root.directive';
import { deregisterContainer, registerContainer, setDocument } from './containers.registry';
import { IIgnoreClickOutsideContainer } from './types';

@Directive()
export abstract class IgnoreClickOutsideContainerBase implements IIgnoreClickOutsideContainer {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly destroyRef = inject(DestroyRef);
    readonly rootDirectives = viewChildren(RdxPopoverRootDirective);
    readonly document = inject(DOCUMENT);

    protected constructor() {
        afterNextRender(() => {
            this.elementRef.nativeElement.querySelectorAll('.container').forEach((container) => {
                const popoverRootInsideContainer = this.rootDirectives().find((popoverRoot) =>
                    container.contains(popoverRoot.popoverTriggerDirective().elementRef.nativeElement)
                );
                if (popoverRootInsideContainer) {
                    setDocument(this.document);
                    registerContainer(container, popoverRootInsideContainer);
                    this.destroyRef.onDestroy(() => deregisterContainer(container));
                }
            });
        });
    }
}
