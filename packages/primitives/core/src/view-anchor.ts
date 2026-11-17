import { Component, ViewContainerRef } from '@angular/core';

/** @internal An inert native boundary whose view participates in Angular hydration metadata. */
@Component({
    selector: 'template[rdxViewAnchor]',
    template: '',
    host: { 'data-rdx-view-anchor': '' }
})
export class RdxViewAnchor {}

/** @internal Owned by the declaring container; creates no layout or focusable content. */
export function createViewAnchor(container: ViewContainerRef): {
    element: HTMLTemplateElement;
    destroy: () => void;
    realign: () => void;
} {
    const view = container.createComponent(RdxViewAnchor);
    return {
        element: view.location.nativeElement as HTMLTemplateElement,
        destroy: () => view.destroy(),
        realign: () => {
            const index = container.indexOf(view.hostView);
            if (index < 0) return;
            container.detach(index);
            container.insert(view.hostView, index);
        }
    };
}
