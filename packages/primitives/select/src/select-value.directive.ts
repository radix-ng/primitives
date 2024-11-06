import { Component, inject } from '@angular/core';
import { RdxSelectRootComponent } from '@radix-ng/primitives/select';

@Component({
    selector: '[rdxSelectValue]',
    standalone: true,
    exportAs: 'rdxSelectValue',
    template: `
        @if (selectRoot.selectionModel.isEmpty()) {
            <ng-content />
        } @else {
            {{ selectRoot.selected }}
        }
    `
})
export class RdxSelectValue {
    selectRoot = inject(RdxSelectRootComponent);
}
