import { afterNextRender, DestroyRef, Directive, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { injectDocument, RDX_POSITIONING_DEFAULTS } from '@radix-ng/primitives/core';
import { RdxTooltipRootDirective } from '../../src/tooltip-root.directive';
import { injectRdxCdkEventService } from '../../src/utils/cdk-event.service';
import { deregisterContainer, registerContainer, setRdxCdkEventService } from './containers.registry';
import { IArrowDimensions, IIgnoreClickOutsideContainer } from './types';

@Directive()
export abstract class OptionPanelBase implements IIgnoreClickOutsideContainer, IArrowDimensions {
    onOverlayEscapeKeyDownDisabled = signal(false);
    onOverlayOutsideClickDisabled = signal(false);

    arrowWidth = signal(RDX_POSITIONING_DEFAULTS.arrow.width);
    arrowHeight = signal(RDX_POSITIONING_DEFAULTS.arrow.height);

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly destroyRef = inject(DestroyRef);
    readonly rootDirectives = viewChildren(RdxTooltipRootDirective);
    readonly document = injectDocument();
    readonly rdxCdkEventService = injectRdxCdkEventService();

    protected constructor() {
        afterNextRender(() => {
            this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.container').forEach((container) => {
                const rootInsideContainer = this.rootDirectives().find((rootDirective) =>
                    container.contains(rootDirective.triggerDirective().elementRef.nativeElement)
                );
                if (rootInsideContainer) {
                    setRdxCdkEventService(this.rdxCdkEventService);
                    registerContainer(container, rootInsideContainer);
                    this.destroyRef.onDestroy(() => deregisterContainer(container));
                }
            });
        });
    }
}
