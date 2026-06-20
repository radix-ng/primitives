import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    EmbeddedViewRef,
    inject,
    input,
    Renderer2,
    signal,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { getMaxTransitionDuration } from '@radix-ng/primitives/core';
import { injectNavigationMenuRootContext, RdxNavigationMenuContentEntry } from './navigation-menu-root-context';
import { getActivationDirection, removeIds } from './utils';

interface RenderedContent {
    value: string;
    entry: RdxNavigationMenuContentEntry;
    view: EmbeddedViewRef<unknown>;
    /** The `data-current` wrapper appended to the viewport (stretches to the viewport box). */
    element: HTMLElement;
    /** The content's own root element, measured for the size morph (sizes to its content). */
    measureTarget: HTMLElement;
}

/**
 * Clips and animates the active item's content. A single viewport is shared between all items; when
 * the active item changes the outgoing content is retained as `data-previous` until its CSS
 * animation/transition completes, and the new content is marked `data-current`.
 */
@Directive({
    selector: '[rdxNavigationMenuViewport]',
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-activation-direction]': 'activationDirection()',
        '[attr.data-transitioning]': 'transitioning() ? "" : undefined'
    }
})
export class RdxNavigationMenuViewport {
    protected readonly rootContext = injectNavigationMenuRootContext();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly renderer = inject(Renderer2);

    /**
     * Keep the viewport mounted even when the menu is closed.
     */
    readonly forceMount = input(false, { transform: booleanAttribute });

    protected readonly activationDirection = signal<string | undefined>(undefined);
    protected readonly transitioning = signal(false);
    protected readonly size = signal<{ width: number; height: number } | null>(null);

    private current: RenderedContent | null = null;
    private readonly rendered = new Map<string, RenderedContent>();
    private previousElement: HTMLElement | null = null;
    private pendingDirection: string | undefined;
    private cleanupTimer: ReturnType<typeof setTimeout> | undefined;
    private readonly resizeObserver =
        typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.measure()) : null;

    private readonly activeContent = computed(() =>
        this.rootContext.isOpen() || this.rootContext.transitionStatus() === 'ending'
            ? this.rootContext.activeContent()
            : undefined
    );
    private readonly contents = computed(() => this.rootContext.contents());

    constructor() {
        const unregister = this.rootContext.registerViewport((previous, next) => {
            this.pendingDirection = getActivationDirection(previous, next);
        });

        effect(() => {
            const entry = this.activeContent();
            const contents = this.contents();
            untracked(() => this.sync(contents, entry));
        });

        inject(DestroyRef).onDestroy(() => {
            unregister();
            this.resizeObserver?.disconnect();
            this.clearCleanupTimer();
            this.removePrevious();
            this.rendered.forEach((content) => content.view.destroy());
            this.rendered.clear();
            this.current = null;
        });
    }

    private sync(
        contents: Map<string, RdxNavigationMenuContentEntry>,
        activeEntry: RdxNavigationMenuContentEntry | undefined
    ) {
        for (const content of [...this.rendered.values()]) {
            if (content.value === activeEntry?.value) {
                continue;
            }

            const latestEntry = contents.get(content.value);
            if (!latestEntry || !latestEntry.forceMount()) {
                if (content !== this.current) {
                    this.destroyRendered(content);
                }
            }
        }

        for (const entry of contents.values()) {
            if (entry.value !== activeEntry?.value && entry.forceMount() && !this.rendered.has(entry.value)) {
                this.markInactive(this.createRendered(entry));
            }
        }

        this.render(activeEntry);
    }

    private render(entry: RdxNavigationMenuContentEntry | undefined) {
        if (!entry) {
            this.deactivateCurrent();
            return;
        }

        if (this.current?.value === entry.value) {
            return;
        }

        this.deactivateCurrent();

        const next = this.rendered.get(entry.value) ?? this.createRendered(entry);
        this.markCurrent(next);
        this.current = next;
        this.resizeObserver?.observe(next.measureTarget);
        this.measure();
    }

    private createRendered(entry: RdxNavigationMenuContentEntry): RenderedContent {
        const view = this.viewContainerRef.createEmbeddedView(entry.templateRef);
        view.detectChanges();

        const element = this.renderer.createElement('div') as HTMLElement;
        this.renderer.setAttribute(element, 'data-current', '');
        this.renderer.setAttribute(element, 'id', entry.contentId);
        this.renderer.setAttribute(element, 'aria-labelledby', entry.triggerId);
        // Make the panel a valid focus target for keyboard entry when it has no tabbable content.
        this.renderer.setAttribute(element, 'tabindex', '-1');
        view.rootNodes.forEach((node: Node) => this.renderer.appendChild(element, node));
        this.renderer.appendChild(this.elementRef.nativeElement, element);

        // Measure the content's own root element, not the wrapper: the wrapper is `display: block`
        // and stretches to the viewport, so measuring it would feed the viewport its own width back
        // and the popup would balloon to fill the page. The content root sizes to its content.
        const measureTarget = (element.firstElementChild as HTMLElement | null) ?? element;

        const rendered = { value: entry.value, entry, view, element, measureTarget };
        this.rendered.set(entry.value, rendered);
        return rendered;
    }

    private deactivateCurrent() {
        const current = this.current;
        if (!current) {
            return;
        }

        this.resizeObserver?.unobserve(current.measureTarget);

        if (current.entry.forceMount()) {
            this.markInactive(current);
        } else {
            this.startLeave(current.element);
            current.view.destroy();
            this.rendered.delete(current.value);
        }

        this.current = null;
    }

    private markCurrent(content: RenderedContent) {
        content.element.hidden = false;
        content.element.removeAttribute('aria-hidden');
        content.element.removeAttribute('inert');
        content.element.setAttribute('data-current', '');
        content.element.removeAttribute('data-previous');
    }

    private markInactive(content: RenderedContent) {
        this.resizeObserver?.unobserve(content.measureTarget);
        content.element.hidden = true;
        content.element.setAttribute('aria-hidden', 'true');
        content.element.setAttribute('inert', '');
        content.element.removeAttribute('data-current');
        content.element.removeAttribute('data-previous');
    }

    private destroyRendered(content: RenderedContent) {
        this.resizeObserver?.unobserve(content.measureTarget);
        content.view.destroy();
        this.rendered.delete(content.value);
        if (this.current === content) {
            this.current = null;
        }
    }

    private startLeave(element: HTMLElement) {
        this.removePrevious();

        const previous = element.cloneNode(true) as HTMLElement;
        previous.removeAttribute('data-current');
        previous.setAttribute('data-previous', '');
        previous.setAttribute('aria-hidden', 'true');
        previous.setAttribute('inert', '');
        removeIds(previous);

        this.activationDirection.set(this.pendingDirection);
        this.pendingDirection = undefined;
        this.previousElement = previous;
        this.transitioning.set(true);
        this.renderer.appendChild(this.elementRef.nativeElement, previous);

        const onEnd = () => this.removePrevious();
        previous.addEventListener('animationend', onEnd, { once: true });
        previous.addEventListener('transitionend', onEnd, { once: true });

        const duration = getMaxTransitionDuration(previous);
        this.cleanupTimer = setTimeout(onEnd, duration > 0 ? duration + 50 : 0);
    }

    private removePrevious() {
        this.clearCleanupTimer();
        this.previousElement?.remove();
        this.previousElement = null;
        this.transitioning.set(false);
    }

    private clearCleanupTimer() {
        if (this.cleanupTimer !== undefined) {
            clearTimeout(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
    }

    private measure() {
        const target = this.current?.measureTarget;

        if (!target || !target.isConnected) {
            return;
        }

        const width = Math.ceil(target.offsetWidth);
        const height = Math.ceil(target.offsetHeight);

        if (width === 0 && height === 0) {
            return;
        }

        const size = this.size();

        if (!size || size.width !== width || size.height !== height) {
            const nextSize = { width, height };
            this.size.set(nextSize);
            this.rootContext.setSize(nextSize);
        }
    }
}
