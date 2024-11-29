import { ContentChild, Directive, ElementRef, inject } from '@angular/core';
import { RdxSelectValueDirective } from './select-value.directive';
import { RdxSelectComponent } from './select.component';

@Directive({
    selector: '[rdxSelectTrigger]',
    standalone: true,
    host: {
        '[attr.type]': '"button"',
        '[attr.role]': '"combobox"',
        '[attr.aria-autocomplete]': '"none"',
        '[attr.dir]': 'select.dir',
        '[attr.aria-expanded]': 'select.open',
        '[attr.aria-required]': 'select.required',

        '[attr.disabled]': 'select.disabled ? "" : null',
        '[attr.data-disabled]': 'select.disabled ? "" : null',
        '[attr.data-state]': "select.open ? 'open': 'closed'",
        '[attr.data-placeholder]': 'value.placeholder || null'
    }
})
export class RdxSelectTriggerDirective {
    protected nativeElement = inject(ElementRef).nativeElement;
    protected select = inject(RdxSelectComponent);

    @ContentChild(RdxSelectValueDirective) protected value: RdxSelectValueDirective;

    focus() {
        this.nativeElement.focus();
    }
}
