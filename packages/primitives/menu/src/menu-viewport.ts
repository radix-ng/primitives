import { afterNextRender, DestroyRef, Directive, ElementRef, inject, signal } from '@angular/core';

/**
 * A viewport that smoothly animates the popup size when its content changes
 * (e.g. switching menubar menus of different sizes, or expanding a section).
 *
 * It measures its content with a `ResizeObserver` and exposes the current size
 * as `--popup-width` / `--popup-height` CSS variables on the host. Drive the
 * animation from the consumer side, for example:
 *
 * ```css
 * [rdxMenuPopup] {
 *     width: var(--popup-width);
 *     height: var(--popup-height);
 *     transition: width 200ms, height 200ms;
 * }
 * ```
 *
 * `data-transitioning` is present while a size change is in flight.
 */
@Directive({
    selector: '[rdxMenuViewport]',
    exportAs: 'rdxMenuViewport',
    host: {
        '[attr.data-transitioning]': 'transitioning() ? "" : undefined',
        '[style.--popup-width.px]': 'width()',
        '[style.--popup-height.px]': 'height()'
    }
})
export class RdxMenuViewport {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);
    private observer: ResizeObserver | undefined;
    private transitionTimer: ReturnType<typeof setTimeout> | undefined;

    protected readonly width = signal<number | undefined>(undefined);
    protected readonly height = signal<number | undefined>(undefined);
    protected readonly transitioning = signal(false);

    constructor() {
        afterNextRender(() => {
            const el = this.elementRef.nativeElement;

            // Seed the initial size without marking a transition.
            this.width.set(el.offsetWidth);
            this.height.set(el.offsetHeight);

            if (typeof ResizeObserver === 'undefined') {
                return;
            }

            this.observer = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (!entry) {
                    return;
                }

                const nextWidth = Math.round(entry.contentRect.width);
                const nextHeight = Math.round(entry.contentRect.height);

                if (nextWidth === this.width() && nextHeight === this.height()) {
                    return;
                }

                this.width.set(nextWidth);
                this.height.set(nextHeight);
                this.markTransitioning();
            });

            this.observer.observe(el);
        });

        this.destroyRef.onDestroy(() => {
            this.observer?.disconnect();
            clearTimeout(this.transitionTimer);
        });
    }

    private markTransitioning(): void {
        this.transitioning.set(true);
        clearTimeout(this.transitionTimer);

        const duration = getMaxTransitionDuration(this.elementRef.nativeElement);
        this.transitionTimer = setTimeout(() => this.transitioning.set(false), duration > 0 ? duration + 50 : 0);
    }
}

function getMaxTransitionDuration(element: HTMLElement): number {
    const style = getComputedStyle(element);
    return Math.max(
        getMaxDuration(style.transitionDuration, style.transitionDelay),
        getMaxDuration(style.animationDuration, style.animationDelay)
    );
}

function getMaxDuration(durations: string, delays: string): number {
    const d = durations.split(',').map(parseDuration);
    const dl = delays.split(',').map(parseDuration);
    return d.reduce((max, dur, i) => Math.max(max, dur + (dl[i % dl.length] ?? 0)), 0);
}

function parseDuration(value: string): number {
    const n = Number.parseFloat(value);
    if (Number.isNaN(n)) {
        return 0;
    }
    return value.trim().endsWith('ms') ? n : n * 1000;
}
