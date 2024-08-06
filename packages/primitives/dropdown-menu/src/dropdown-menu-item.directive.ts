import { CdkMenuItem } from '@angular/cdk/menu';
import {
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RdxDropdownMenuContentDirective } from './dropdown-menu-content.directive';

@Directive({
    selector: '[rdxDropdownMenuItem]',
    standalone: true,
    // todo hostDirectives + extends
    hostDirectives: [{ directive: CdkMenuItem, inputs: ['cdkMenuItemDisabled: disabled'] }],
    host: {
        type: 'button',
        // todo horizontal ?
        '[attr.data-orientation]': '"vertical"',
        '[attr.data-highlighted]': 'highlighted ? "" : null',
        '[attr.data-disabled]': 'cdkMenuItem.disabled ? "" : null',
        '[attr.disabled]': 'cdkMenuItem.disabled ? "" : null',
        '(pointermove)': 'onPointerMove()',
        '(focus)': 'menu.highlighted.next(this)'
    }
})
export class RdxDropdownMenuItemDirective {
    protected readonly menu = inject(RdxDropdownMenuContentDirective);
    protected readonly cdkMenuItem = inject(CdkMenuItem);
    protected readonly elementRef = inject(ElementRef);

    highlighted = false;

    get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    @Output() readonly onSelect = new EventEmitter<void>();

    constructor() {
        this.menu.highlighted
            .pipe(takeUntilDestroyed())
            .subscribe((value) => {
                if (value !== this) {
                    this.highlighted = false;
                }
            });

        this.cdkMenuItem.triggered.subscribe(this.onSelect);
    }

    protected onPointerMove() {
        this.nativeElement.focus({ preventScroll: true })
    }
}
