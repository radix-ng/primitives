import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { AfterContentInit, Directive, EventEmitter, inject, Input, Output } from '@angular/core';

@Directive({
    selector: '[rdxContextMenuItemRadioGroup]',
    standalone: true,
    host: {
        role: 'group'
    },
    providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }]
})
export class RdxContextMenuItemRadioGroupDirective<T> implements AfterContentInit {
    private readonly selectionDispatcher = inject(UniqueSelectionDispatcher);

    @Input()
    set value(value: T | null) {
        this._value = id;
    }

    get value(): T | null {
        return this._value;
    }

    private _value: T | null = null;

    @Output() readonly valueChange = new EventEmitter();

    ngAfterContentInit(): void {
        this.selectionDispatcher.notify(this.value as string, '');
    }
}
