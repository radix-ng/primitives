import { AfterViewInit, contentChild, Directive, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { RdxSelectValueDirective } from './select-value.directive';
import { RdxSelectComponent } from './select.component';

@Directive({
    selector: '[rdxSelectTrigger]',
    standalone: true,
    host: {
        '[attr.type]': '"button"',
        '[attr.role]': '"combobox"',
        '[attr.aria-autocomplete]': '"none"',
        '[attr.dir]': 'select.dir.value',
        '[attr.aria-expanded]': 'select.open',
        '[attr.aria-required]': 'select.required',
        '[attr.disabled]': 'select.disabled ? "" : null',
        '[attr.data-disabled]': 'select.disabled ? "" : null',
        '[attr.data-state]': "select.open ? 'open': 'closed'",
        '[attr.data-placeholder]': 'value().placeholder || null'
    }
})
export class RdxSelectTriggerDirective implements AfterViewInit, OnDestroy {
    readonly ngZone = inject(NgZone);
    protected nativeElement = inject(ElementRef).nativeElement;
    protected select = inject(RdxSelectComponent);

    protected readonly value = contentChild.required(RdxSelectValueDirective);

    private resizeObserver: ResizeObserver | null;

    ngAfterViewInit(): void {
        this.select.triggerSize.set([this.nativeElement.offsetWidth, this.nativeElement.offsetHeight]);
        this.observeTriggerResize();
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
    }

    focus() {
        this.nativeElement.focus();
    }

    private observeTriggerResize() {
        if (typeof ResizeObserver === 'undefined' || !ResizeObserver) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            this.resizeObserver = new ResizeObserver(() => {
                this.select.triggerSize.set([this.nativeElement.offsetWidth, this.nativeElement.offsetHeight]);
            });
            this.resizeObserver.observe(this.nativeElement);
        });
    }
}
