import { isDevMode } from '@angular/core';
import { RdxTooltipRootDirective } from '../../src/tooltip-root.directive';
import { injectRdxCdkEventService } from '../../src/utils/cdk-event.service';

const containerRegistry: Map<HTMLElement, RdxTooltipRootDirective> = new Map();
let rdxCdkEventService: ReturnType<typeof injectRdxCdkEventService> | undefined = void 0;

const domRootClickEventCallback: (event: MouseEvent) => void = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const containers = Array.from(containerRegistry.keys());
    const containerContainingTarget = containers
        .map((container) => {
            container.classList.remove('focused');
            return container;
        })
        .find((container) => {
            return container.contains(target);
        });
    containerContainingTarget?.classList.add('focused');
    Array.from(containerRegistry.entries()).forEach((item) => {
        if (item[0] === containerContainingTarget) {
            rdxCdkEventService?.allowPrimitiveForCdkMultiEvents(item[1], [
                'cdkOverlayOutsideClick',
                'cdkOverlayEscapeKeyDown'
            ]);
        } else {
            rdxCdkEventService?.preventPrimitiveFromCdkMultiEvents(item[1], [
                'cdkOverlayOutsideClick',
                'cdkOverlayEscapeKeyDown'
            ]);
        }
    });
};

export function registerContainer(container: HTMLElement, root: RdxTooltipRootDirective) {
    if (containerRegistry.has(container)) {
        return;
    }
    containerRegistry.set(container, root);
    if (containerRegistry.size === 1) {
        rdxCdkEventService?.addClickDomRootEventCallback(domRootClickEventCallback);
    }
}

export function deregisterContainer(container: HTMLElement) {
    if (!containerRegistry.has(container)) {
        return;
    }
    containerRegistry.delete(container);
    if (containerRegistry.size === 0) {
        rdxCdkEventService?.removeClickDomRootEventCallback(domRootClickEventCallback);
        unsetRdxCdkEventService();
    }
}

export function setRdxCdkEventService(service: typeof rdxCdkEventService) {
    isDevMode() && console.log('setRdxCdkEventService', service, rdxCdkEventService === service);
    rdxCdkEventService ??= service;
}

export function unsetRdxCdkEventService() {
    rdxCdkEventService = void 0;
}
