import { Component, inject, Input } from '@angular/core';
import { RdxSelectComponent } from '@radix-ng/primitives/select';

@Component({
    selector: '[rdxSelectValue]',
    standalone: true,
    exportAs: 'rdxSelectValue',
    template: `
        @if (select.selectionModel.isEmpty()) {
            {{ placeholder }}
        } @else {
            {{ select.selected }}
        }
    `
})
export class RdxSelectValue {
    select = inject(RdxSelectComponent);

    @Input() placeholder: string;
}
