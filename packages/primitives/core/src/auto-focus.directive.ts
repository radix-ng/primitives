import { BooleanInput } from '@angular/cdk/coercion';
import {
    AfterViewInit,
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    input
} from '@angular/core';

/*
 * <div [rdxAutoFocus]="true"></div>
 */

@Directive({
    selector: '[rdxAutoFocus]',
    standalone: true
})
export class RdxAutoFocusDirective implements AfterViewInit {
    #elementRef = inject(ElementRef);

    readonly autoFocus = input<boolean, BooleanInput>(false, {
        alias: 'rdxAutoFocus',
        transform: booleanAttribute
    });

    ngAfterViewInit(): void {
        if (this.autoFocus()) {
            setTimeout(() => {
                this.#elementRef.nativeElement.focus();
            });
        }
    }
}
