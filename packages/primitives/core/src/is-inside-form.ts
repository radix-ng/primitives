import { ElementRef } from '@angular/core';

export function isInsideForm(el: ElementRef<HTMLElement> | null): boolean {
    if (!el || !el.nativeElement) {
        return true;
    }
    return Boolean(el.nativeElement.closest('form'));
}
