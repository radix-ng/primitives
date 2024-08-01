import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    input
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RdxMenuItemDirective } from '@radix-ng/primitives/menu';
import { RdxDropdownMenuContentDirective } from './dropdown-menu-content.directive';

@Directive({
    selector: '[rdxDropdownMenuItem]',
    standalone: true,
    hostDirectives: [{ directive: RdxMenuItemDirective, inputs: ['rdxDisabled: disabled '] }],
    host: {
        '(pointermove)': 'onPointerMove()',
        '(focus)': 'menu.highlighted.next(this)',
        '(blur)': 'menu.highlighted.next(this)',
        '[attr.data-highlighted]': 'highlighted ? "" : null',
        type: 'button',
    }
})
export class RdxDropdownMenuItemDirective {
    protected readonly menu = inject(RdxDropdownMenuContentDirective);

    highlighted = false;

    /*
     * When true, prevents the user from interacting with the item.
     */
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
        alias: 'rdxDisabled'
    });

    get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    constructor(private elementRef: ElementRef) {
        this.menu.highlighted
            .pipe(takeUntilDestroyed())
            .subscribe((value) => {
                if (value !== this) {
                    this.highlighted = false;
                }
            });
    }

    onPointerMove() {
        this.nativeElement.focus({ preventScroll: true })
    }
}
