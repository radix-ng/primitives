import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, ElementRef, EventEmitter, inject, input, Output } from '@angular/core';

export type ButtonType = 'button' | 'submit' | 'reset';

let nextId = 0;

@Directive({
    selector: '[rdxButton]',
    standalone: true,
    host: {
        '[attr.id]': 'id()',
        '[attr.role]': 'type()',
        '[attr.disabled]': 'disabled() ? disabled() : null',
        '(click)': 'onClick($event)',
        '(blur)': 'onBlur()'
    }
})
export abstract class RdxButtonAbstractDirective {
    #elementRef = inject(ElementRef);

    readonly id = input<string>(`rdx-button-${nextId++}`);

    readonly type = input<ButtonType>('button');

    readonly isLoading = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    @Output() onClickHandler = new EventEmitter<MouseEvent>();

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
