import { Component, inject, Input } from '@angular/core';
import { RdxSelectComponent } from './select.component';

@Component({
    selector: '[rdxSelectValue]',
    standalone: true,
    exportAs: 'rdxSelectValue',
    template: `
        {{ select.selectionModel.isEmpty() ? placeholder : select.selected }}
    `
})
export class RdxSelectValueDirective {
    select = inject(RdxSelectComponent);

    @Input() placeholder: string;
}
