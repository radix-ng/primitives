import { CDK_MENU, CdkMenuItem } from '@angular/cdk/menu';
import { booleanAttribute, Directive, ElementRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RdxDropdownMenuContentDirective } from './dropdown-menu-content.directive';

@Directive({
    selector: '[rdxDropdownMenuItem]',
    standalone: true,
    host: {
        type: 'button',
        // todo horizontal ?
        '[attr.data-orientation]': '"vertical"',
        '[attr.data-highlighted]': 'highlighted ? "" : null',
        '[attr.data-disabled]': 'disabled ? "" : null',
        '[attr.disabled]': 'disabled ? "" : null',
        '(pointermove)': 'onPointerMove()',
        '(focus)': 'menu.highlighted.next(this)',
        '(keydown)': 'onKeydown($event)'
    },
    providers: [
        { provide: CdkMenuItem, useExisting: RdxDropdownMenuItemDirective },
        { provide: CDK_MENU, useExisting: RdxDropdownMenuContentDirective }
    ]
})
export class RdxDropdownMenuItemDirective extends CdkMenuItem {
    protected readonly menu = inject(RdxDropdownMenuContentDirective);
    protected readonly nativeElement = inject(ElementRef).nativeElement;

    highlighted = false;

    @Input({ transform: booleanAttribute }) override disabled: boolean = false;

    @Output() readonly onSelect = new EventEmitter<void>();

    constructor() {
        super();

        this.menu.highlighted.pipe(takeUntilDestroyed()).subscribe((value) => {
            if (value !== this) {
                this.highlighted = false;
            }
        });

        this.triggered.subscribe(this.onSelect);
    }

    protected onPointerMove() {
        if (!this.highlighted) {
            this.nativeElement.focus({ preventScroll: true });
            this.menu.updateActiveItem(this);
        }
    }

    protected onKeydown(event: KeyboardEvent) {
        if (this.nativeElement.tagName !== 'BUTTON' && ['Enter', ' '].includes(event.key)) {
            event.preventDefault();
        }

        if (event.key === 'Escape') {
            if (!this.menu.closeOnEscape) {
                event.stopPropagation();
            } else {
                this.menu.onEscapeKeyDown(event);
            }
        }
    }
}
