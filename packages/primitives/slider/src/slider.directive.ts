import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    inject,
    Input,
    NgZone,
    numberAttribute,
    OnDestroy
} from '@angular/core';

@Directive({
    standalone: true
})
export class RdxSliderDirective implements AfterViewInit, OnDestroy {
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly ngZone = inject(NgZone);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    @Input({ transform: numberAttribute }) max = 100;
    @Input({ transform: numberAttribute }) min = 0;

    @Input({ transform: booleanAttribute }) disabled = false;

    private resizeObserver: ResizeObserver | null | undefined;
    private resizeTimer: null | ReturnType<typeof setTimeout> = null;

    ngAfterViewInit(): void {
        this.observeHostResize();
        this.cdr.detectChanges();
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
    }

    private observeHostResize() {
        if (typeof ResizeObserver === 'undefined' || !ResizeObserver) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            this.resizeObserver = new ResizeObserver(() => {
                if (this.resizeTimer) {
                    clearTimeout(this.resizeTimer);
                }
                this.onResize();
            });
            this.resizeObserver.observe(this.elementRef.nativeElement);
        });
    }

    onResize(): void {
        this.cdr.detectChanges();
    }
}
