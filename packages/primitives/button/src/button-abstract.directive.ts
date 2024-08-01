import { booleanAttribute, Directive, ElementRef, EventEmitter, inject, Input, Output } from '@angular/core';

type ButtonType = 'button' | 'submit' | 'reset';

let idIterator = 0;

@Directive({
    standalone: true,
    host: {
        '[attr.id]': 'this.id',
        '[attr.role]': 'this.type',
        '[attr.disabled]': 'disabled ? disabled : null',
        '(click)': 'onClick($event)',
        '(blur)': 'onBlur()'
    }
})
export abstract class RdxButtonAbstractDirective {
    #elementRef = inject(ElementRef);

    @Input({ transform: booleanAttribute }) disabled = false;

    @Input() type: ButtonType = 'button';

    @Output() onClickHandler = new EventEmitter<MouseEvent>();

    @Input() id = `rdx-button-${idIterator++}`;

    protected focused = false;

    protected onClick(event: MouseEvent) {
        this.onClickHandler.emit(event);
        this.focused = false;
    }

    protected onBlur() {
        this.focused = false;
    }

    get nativeElement() {
        return this.#elementRef.nativeElement;
    }
}
