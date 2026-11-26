import {
    afterNextRender,
    afterRenderEffect,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    signal,
    Signal,
    untracked
} from '@angular/core';
import { getMaxTransitionDuration, waitForAnimations } from '../dom/wait-for-animations';

export interface RdxPopupViewportConfig {
    popup: () => HTMLElement | undefined;
    open: () => boolean;
    /** Retains outgoing content through an accepted exit, including a retained Portal. */
    present?: () => boolean;
    register?: (notify: (previous: HTMLElement, next: HTMLElement) => void) => () => void;
    /** Captures committed content when the trigger and payload are derived from inputs. */
    track?: { trigger: () => HTMLElement | undefined; payload: () => unknown };
    measure?: boolean;
}

export interface RdxPopupViewport {
    activationDirection: Signal<string | undefined>;
    transitioning: Signal<boolean>;
    width: Signal<number | undefined>;
    height: Signal<number | undefined>;
}

interface ViewportSnapshot {
    trigger: HTMLElement;
    content: HTMLElement;
    size: { width: number; height: number } | undefined;
}

function makeInertSnapshot(element: HTMLElement): void {
    element.setAttribute('aria-hidden', 'true');
    element.setAttribute('inert', '');
    element.removeAttribute('id');
    element.querySelectorAll('[id]').forEach((child) => child.removeAttribute('id'));
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
    private snapshot?: ViewportSnapshot;
    private popupSize?: { width: number; height: number };
    private animation?: AbortController;
    private resize?: ResizeObserver;
    private observedContent?: HTMLElement;
    private mutation?: MutationObserver;
    private cleanupTimer?: ReturnType<typeof setTimeout>;
    private frame?: number;
    private resizeFrame?: number;

    constructor(private readonly config: RdxPopupViewportConfig) {
        const unregister = config.register?.((previous, next) => this.start(previous, next));
        const track = config.track;
        if (track) {
            afterRenderEffect({
                mixedReadWrite: () => {
                    const trigger = config.open() ? track.trigger() : undefined;
                    track.payload();
                    untracked(() => this.reconcileSnapshot(trigger));
                }
            });
        }
        effect(() => {
            if (!(config.present?.() ?? config.open())) this.cleanup();
        });
        afterNextRender(() => {
            this.markCurrent();
            this.measure();
            this.mutation = new MutationObserver((records) => {
                if (track && records.every((record) => !this.isContentMutation(record))) return;

                this.markCurrent();
                if (!track || !this.previous) this.measure();
                if (track && this.snapshot && track.trigger() === this.snapshot.trigger) {
                    this.captureSnapshot(this.snapshot.trigger);
                }
            });
            this.mutation.observe(this.host, { childList: true, characterData: !!track, subtree: !!track });
            if (config.measure !== false && typeof ResizeObserver !== 'undefined') {
                this.resize = new ResizeObserver(() => {
                    // Publishing ancestor dimensions during RO delivery can cause a resize loop.
                    // Measure the live border box once on the next frame, including wrapper padding.
                    if (this.resizeFrame !== undefined || (track && this.previous)) return;
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
            unregister?.();
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

    private isContentMutation(record: MutationRecord): boolean {
        if (record.target === this.host) {
            return [...record.addedNodes, ...record.removedNodes].some(
                (node) => node.nodeType !== 1 || !(node as Element).hasAttribute('data-previous')
            );
        }
        return this.current()?.contains(record.target) ?? false;
    }

    private measure(width?: number, height?: number): void {
        if (this.config.measure === false || !this.config.open()) return;
        const current = this.current();
        if (!current) return;
        const popup = this.config.popup();
        if (popup && this.config.track) {
            const size = this.measureNaturalSize(popup);
            if (size.width === this.popupSize?.width && size.height === this.popupSize?.height) return;

            this.popupSize = size;
            this.width.set(size.width);
            this.height.set(size.height);
            this.writePopupSize(popup, size.width, size.height);
            return;
        }

        const nextWidth = width ?? current.offsetWidth;
        const nextHeight = height ?? current.offsetHeight;
        if (nextWidth === this.width() && nextHeight === this.height()) return;
        const changed = this.width() !== undefined;
        this.width.set(nextWidth);
        this.height.set(nextHeight);
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
            this.writePopupSize(popup, nextWidth + extraWidth, nextHeight + extraHeight);
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

    private writePopupSize(popup: HTMLElement, width: number, height: number): void {
        popup.style.setProperty('--popup-width', `${width}px`);
        popup.style.setProperty('--popup-height', `${height}px`);
        popup.parentElement?.style.setProperty('--positioner-width', `${width}px`);
        popup.parentElement?.style.setProperty('--positioner-height', `${height}px`);
    }

    private measureNaturalSize(popup: HTMLElement): { width: number; height: number } {
        // Measure outside the live box so its existing size transition and outgoing snapshot do
        // not constrain the new content. Keep the popup's inherited typography and constraints.
        const clone = popup.cloneNode(true) as HTMLElement;
        makeInertSnapshot(clone);
        clone.querySelectorAll('[data-previous]').forEach((element) => element.remove());
        const styles = {
            position: 'absolute',
            inset: '0 auto auto 0',
            visibility: 'hidden',
            width: 'max-content',
            height: 'auto',
            animation: 'none',
            transition: 'none'
        };
        Object.entries(styles).forEach(([name, value]) => clone.style.setProperty(name, value, 'important'));
        popup.after(clone);
        try {
            return { width: clone.offsetWidth, height: clone.offsetHeight };
        } finally {
            clone.remove();
        }
    }

    private reconcileSnapshot(trigger: HTMLElement | undefined): void {
        if (!trigger) {
            this.snapshot = undefined;
            return;
        }

        if (this.snapshot && this.snapshot.trigger !== trigger) {
            this.start(this.snapshot.trigger, trigger, this.snapshot);
        } else {
            if (!this.snapshot && this.previous) this.cleanup();
            this.measure();
        }
        this.captureSnapshot(trigger);
    }

    private captureSnapshot(trigger: HTMLElement): void {
        const current = this.current();
        if (current) {
            this.snapshot = { trigger, content: current.cloneNode(true) as HTMLElement, size: this.popupSize };
        }
    }

    private start(from: HTMLElement, to: HTMLElement, snapshot?: ViewportSnapshot): void {
        const current = this.current();
        if (!current) return;
        this.cleanup();
        const previousRect = from.getBoundingClientRect(),
            nextRect = to.getBoundingClientRect();
        const dx = nextRect.left + nextRect.width / 2 - previousRect.left - previousRect.width / 2;
        const dy = nextRect.top + nextRect.height / 2 - previousRect.top - previousRect.height / 2;
        const tolerance = snapshot ? 5 : 0;
        this.activationDirection.set(
            [
                dx < -tolerance ? 'left' : dx > tolerance ? 'right' : '',
                dy < -tolerance ? 'up' : dy > tolerance ? 'down' : ''
            ]
                .filter(Boolean)
                .join(' ') || undefined
        );
        const previous = snapshot?.content ?? (current.cloneNode(true) as HTMLElement);
        previous.removeAttribute('data-current');
        previous.removeAttribute('data-starting-style');
        previous.setAttribute('data-previous', '');
        makeInertSnapshot(previous);
        if (snapshot) previous.style.position = 'absolute';
        const size = snapshot?.size ?? this.config.popup()?.getBoundingClientRect();
        if (size) {
            previous.style.setProperty('--popup-width', `${size.width}px`);
            previous.style.setProperty('--popup-height', `${size.height}px`);
        }
        this.previous = previous;
        if (typeof previous.getAnimations !== 'function') {
            const completed = (event: Event) => {
                if (event.target === previous && this.previous === previous) this.cleanup();
            };
            previous.addEventListener('transitionend', completed);
            previous.addEventListener('animationend', completed);
        }
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
                if (snapshot && this.snapshot?.trigger === to) this.captureSnapshot(to);
                this.animation = new AbortController();
                waitForAnimations([previous, current], () => this.cleanup(), this.animation.signal);
            });
        });
    }

    private cleanup(): void {
        this.animation?.abort();
        this.animation = undefined;
        clearTimeout(this.cleanupTimer);
        if (this.frame !== undefined) cancelAnimationFrame(this.frame);
        this.frame = undefined;
        if (this.resizeFrame !== undefined) cancelAnimationFrame(this.resizeFrame);
        this.resizeFrame = undefined;
        this.current()?.removeAttribute('data-starting-style');
        this.previous?.remove();
        this.previous = undefined;
        this.transitioning.set(false);
    }
}
