import { afterNextRender, DestroyRef, Directive, ElementRef, inject, signal } from '@angular/core';
import { injectRdxPreviewCardRootContext } from './preview-card-root';

/**
 * A viewport for animating content changes when a preview-card moves between triggers.
 *
 * Render one direct child inside the viewport. It is marked with `data-current`;
 * when the active trigger changes, a DOM snapshot is retained as `data-previous`
 * until its CSS animation or transition completes.
 */
@Directive({
    selector: '[rdxPreviewCardViewport]',
    host: {
        '[attr.data-activation-direction]': 'activationDirection()',
        '[attr.data-transitioning]': 'transitioning() ? "" : undefined'
    }
})
export class RdxPreviewCardViewport {
    private readonly rootContext = injectRdxPreviewCardRootContext()!;
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);
    private previous: HTMLElement | undefined;
    private cleanupTimer: ReturnType<typeof setTimeout> | undefined;
    private observer: MutationObserver | undefined;

    protected readonly activationDirection = signal<string | undefined>(undefined);
    protected readonly transitioning = signal(false);

    constructor() {
        const unregister = this.rootContext.registerViewport((previousTrigger, nextTrigger) => {
            this.startTransition(previousTrigger, nextTrigger);
        });

        afterNextRender(() => {
            this.markCurrent();

            this.observer = new MutationObserver(() => this.markCurrent());
            this.observer.observe(this.elementRef.nativeElement, { childList: true });
        });

        this.destroyRef.onDestroy(() => {
            unregister();
            this.observer?.disconnect();
            this.cleanupPrevious();
        });
    }

    private startTransition(previousTrigger: HTMLElement, nextTrigger: HTMLElement) {
        const current = this.current();

        if (!current) {
            return;
        }

        this.cleanupPrevious();
        this.activationDirection.set(getActivationDirection(previousTrigger, nextTrigger));

        const previous = current.cloneNode(true) as HTMLElement;
        const popup = this.elementRef.nativeElement.closest('[rdxPreviewCardPopup]');
        const popupRect = popup?.getBoundingClientRect();

        previous.removeAttribute('data-current');
        previous.setAttribute('data-previous', '');
        previous.setAttribute('aria-hidden', 'true');
        previous.setAttribute('inert', '');
        removeIds(previous);

        if (popupRect) {
            previous.style.setProperty('--popup-width', `${popupRect.width}px`);
            previous.style.setProperty('--popup-height', `${popupRect.height}px`);
        }

        previous.addEventListener('animationend', () => this.cleanupPrevious(), { once: true });
        previous.addEventListener('transitionend', () => this.cleanupPrevious(), { once: true });

        this.previous = previous;
        this.elementRef.nativeElement.insertBefore(previous, current);
        this.transitioning.set(true);

        queueMicrotask(() => this.scheduleCleanup(previous));
    }

    private markCurrent() {
        this.current()?.setAttribute('data-current', '');
    }

    private current() {
        return Array.from(this.elementRef.nativeElement.children).find(
            (child): child is HTMLElement => child instanceof HTMLElement && !child.hasAttribute('data-previous')
        );
    }

    private scheduleCleanup(previous: HTMLElement) {
        if (this.previous !== previous) {
            return;
        }

        const style = getComputedStyle(previous);
        const duration = Math.max(
            getMaxDuration(style.animationDuration, style.animationDelay),
            getMaxDuration(style.transitionDuration, style.transitionDelay)
        );

        this.cleanupTimer = setTimeout(() => this.cleanupPrevious(), duration > 0 ? duration + 50 : 0);
    }

    private cleanupPrevious() {
        if (this.cleanupTimer !== undefined) {
            clearTimeout(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }

        this.previous?.remove();
        this.previous = undefined;
        this.transitioning.set(false);
    }
}

function getActivationDirection(previous: HTMLElement, next: HTMLElement) {
    const previousRect = previous.getBoundingClientRect();
    const nextRect = next.getBoundingClientRect();
    const previousCenter = getCenter(previousRect);
    const nextCenter = getCenter(nextRect);
    const directions: string[] = [];

    if (nextCenter.x < previousCenter.x) {
        directions.push('left');
    } else if (nextCenter.x > previousCenter.x) {
        directions.push('right');
    }

    if (nextCenter.y < previousCenter.y) {
        directions.push('up');
    } else if (nextCenter.y > previousCenter.y) {
        directions.push('down');
    }

    return directions.join(' ') || undefined;
}

function removeIds(element: HTMLElement) {
    element.removeAttribute('id');
    element.querySelectorAll('[id]').forEach((child) => child.removeAttribute('id'));
}

function getCenter(rect: DOMRect) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function getMaxDuration(durations: string, delays: string) {
    const durationValues = durations.split(',').map(parseDuration);
    const delayValues = delays.split(',').map(parseDuration);

    return durationValues.reduce((max, duration, index) => {
        const delay = delayValues[index % delayValues.length] ?? 0;
        return Math.max(max, duration + delay);
    }, 0);
}

function parseDuration(value: string) {
    const duration = Number.parseFloat(value);

    if (Number.isNaN(duration)) {
        return 0;
    }

    return value.trim().endsWith('ms') ? duration : duration * 1000;
}
