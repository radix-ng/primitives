import { Component, inject, Input } from '@angular/core';
import { RdxSelectComponent } from './select.component';

@Component({
    selector: '[rdxSelectValue]',
    standalone: true,
    exportAs: 'rdxSelectValue',
    template: `
        {{ select.selectionModel.isEmpty() ? placeholder : select.selected }}
    `,
    styles: `
        /* we don't want events from the children to bubble through the item they came from */
        :host {
            pointer-events: none;
        }
    `
})
export class RdxSelectValueDirective {
    select = inject(RdxSelectComponent);

    @Input() placeholder: string;
}
