import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Directive, EventEmitter, Input, Output } from '@angular/core';


@Directive({
    selector: '[rdxDropdownMenuItemRadioGroup]',
    standalone: true,
    host: {
        'role': 'group'
    },
    providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }]
})
export class RdxDropdownMenuItemRadioGroupDirective {
    @Input() value = null;

    @Output() readonly onValueChange = new EventEmitter();
}

