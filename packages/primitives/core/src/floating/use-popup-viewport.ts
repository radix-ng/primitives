import { afterNextRender, DestroyRef, effect, ElementRef, inject, signal, Signal } from '@angular/core';
import { getMaxTransitionDuration } from '../composables/use-transition-status';

export interface RdxPopupViewportConfig {
    popup: () => HTMLElement | undefined;
    open: () => boolean;
    /** Retains outgoing content through an accepted exit, including a retained Portal. */
    present?: () => boolean;
    register: (notify: (previous: HTMLElement, next: HTMLElement) => void) => () => void;
    measure?: boolean;
}

export interface RdxPopupViewport {
    activationDirection: Signal<string | undefined>;
    transitioning: Signal<boolean>;
    width: Signal<number | undefined>;
    height: Signal<number | undefined>;
}

/** Visual snapshots only: live Angular content retains its directives, state and event handlers. */
export function usePopupViewport(config: RdxPopupViewportConfig): RdxPopupViewport {
    return new PopupViewport(config);
}

class PopupViewport {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly destroyRef = inject(DestroyRef);
    readonly activationDirection = signal<string | undefined>(undefined);
    readonly transitioning = signal(false);
    readonly width = signal<number | undefined>(undefined);
    readonly height = signal<number | undefined>(undefined);
    private previous: HTMLElement | undefined;
    private resize?: ResizeObserver;
    private observedContent?: HTMLElement;
    private mutation?: MutationObserver;
    private cleanupTimer?: ReturnType<typeof setTimeout>;
    private frame?: number;
    private resizeFrame?: number;

    constructor(private readonly config: RdxPopupViewportConfig) {
        const unregister = config.register((previous, next) => this.start(previous, next));
        effect(() => {
            if (!(config.present?.() ?? config.open())) this.cleanup();
        });
        afterNextRender(() => {
            this.markCurrent();
            this.measure();
            this.mutation = new MutationObserver(() => {
                this.markCurrent();
                this.measure();
            });
            this.mutation.observe(this.host, { childList: true });
            if (config.measure !== false && typeof ResizeObserver !== 'undefined') {
                this.resize = new ResizeObserver(() => {
                    // Publishing ancestor dimensions during RO delivery can cause a resize loop.
                    // Measure the live border box once on the next frame, including wrapper padding.
                    if (this.resizeFrame !== undefined) return;
                    this.resizeFrame = requestAnimationFrame(() => {
                        this.resizeFrame = undefined;
                        this.measure();
                    });
                });
                const current = this.current();
                if (current) this.resize.observe(current);
            }
        });
        this.destroyRef.onDestroy(() => {
            unregister();
            this.resize?.disconnect();
            this.mutation?.disconnect();
            this.cleanup();
        });
    }

    private current(): HTMLElement | undefined {
        return [...this.host.children].find(
            (child): child is HTMLElement => child.nodeType === 1 && !child.hasAttribute('data-previous')
        ) as HTMLElement | undefined;
    }

    private markCurrent(): void {
        const current = this.current();
        current?.setAttribute('data-current', '');
        if (current !== this.observedContent) {
            if (this.observedContent) this.resize?.unobserve(this.observedContent);
            if (current) this.resize?.observe(current);
            this.observedContent = current;
        }
    }

    private measure(width?: number, height?: number): void {
        if (this.config.measure === false || !this.config.open()) return;
        const current = this.current();
        if (!current) return;
        const nextWidth = width ?? current.offsetWidth;
        const nextHeight = height ?? current.offsetHeight;
        if (nextWidth === this.width() && nextHeight === this.height()) return;
        const changed = this.width() !== undefined;
        this.width.set(nextWidth);
        this.height.set(nextHeight);
        const popup = this.config.popup();
        if (popup) {
            const style = getComputedStyle(popup);
            const extraWidth = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce(
                (sum, name) => sum + (parseFloat(style[name as keyof CSSStyleDeclaration] as string) || 0),
                0
            );
            const extraHeight = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce(
                (sum, name) => sum + (parseFloat(style[name as keyof CSSStyleDeclaration] as string) || 0),
                0
            );
            popup.style.setProperty('--popup-width', `${nextWidth + extraWidth}px`);
            popup.style.setProperty('--popup-height', `${nextHeight + extraHeight}px`);
            popup.parentElement?.style.setProperty('--positioner-width', `${nextWidth + extraWidth}px`);
            popup.parentElement?.style.setProperty('--positioner-height', `${nextHeight + extraHeight}px`);
        }
        if (changed && !this.previous) {
            this.transitioning.set(true);
            clearTimeout(this.cleanupTimer);
            this.cleanupTimer = setTimeout(
                () => this.transitioning.set(false),
                getMaxTransitionDuration(this.host) + 50
            );
        }
    }

    private start(from: HTMLElement, to: HTMLElement): void {
        const current = this.current();
        if (!current) return;
        this.cleanup();
        const previousRect = from.getBoundingClientRect(),
            nextRect = to.getBoundingClientRect();
        const dx = nextRect.left + nextRect.width / 2 - previousRect.left - previousRect.width / 2;
        const dy = nextRect.top + nextRect.height / 2 - previousRect.top - previousRect.height / 2;
        this.activationDirection.set(
            [dx < 0 ? 'left' : dx > 0 ? 'right' : '', dy < 0 ? 'up' : dy > 0 ? 'down' : ''].filter(Boolean).join(' ') ||
                undefined
        );
        const previous = current.cloneNode(true) as HTMLElement;
        previous.removeAttribute('data-current');
        previous.removeAttribute('data-starting-style');
        previous.setAttribute('data-previous', '');
        previous.setAttribute('aria-hidden', 'true');
        previous.setAttribute('inert', '');
        previous.removeAttribute('id');
        previous.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
        const popup = this.config.popup();
        if (popup) {
            const rect = popup.getBoundingClientRect();
            previous.style.setProperty('--popup-width', `${rect.width}px`);
            previous.style.setProperty('--popup-height', `${rect.height}px`);
        }
        this.previous = previous;
        const completed = (event: Event) => {
            if (event.target !== previous || this.previous !== previous) return;
            const running = [previous, current]
                .flatMap((element) => element.getAnimations?.() ?? [])
                .some((animation) => animation.playState === 'running' || animation.playState === 'paused');
            if (!running) this.cleanup();
        };
        previous.addEventListener('transitionend', completed);
        previous.addEventListener('animationend', completed);
        this.host.insertBefore(previous, current);
        this.transitioning.set(true);
        current.setAttribute('data-starting-style', '');
        this.frame = requestAnimationFrame(() => {
            // Read the initial styles before the next paint applies the incoming/outgoing state.
            current.getBoundingClientRect();
            this.frame = requestAnimationFrame(() => {
                if (this.previous !== previous) return;
                previous.setAttribute('data-ending-style', '');
                current.removeAttribute('data-starting-style');
                this.measure();
                const duration = Math.max(getMaxTransitionDuration(previous), getMaxTransitionDuration(current));
                const animations = [previous, current]
                    .flatMap((element) => element.getAnimations?.() ?? [])
                    .filter((animation) => animation.playState === 'running' || animation.playState === 'paused');
                if (animations.length)
                    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
                        if (this.previous === previous) this.cleanup();
                    });
                this.cleanupTimer = setTimeout(() => {
                    if (this.previous === previous) this.cleanup();
                }, duration + 50);
            });
        });
    }

    private cleanup(): void {
        clearTimeout(this.cleanupTimer);
        if (this.frame !== undefined) cancelAnimationFrame(this.frame);
        if (this.resizeFrame !== undefined) cancelAnimationFrame(this.resizeFrame);
        this.resizeFrame = undefined;
        this.current()?.removeAttribute('data-starting-style');
        this.previous?.remove();
        this.previous = undefined;
        this.transitioning.set(false);
    }
}
