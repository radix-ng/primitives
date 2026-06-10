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
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-activation-direction]': 'activationDirection()',
        '[attr.data-transitioning]': 'transitioning() ? "" : undefined',
        '[style.--popup-width.px]': 'size()?.width',
        '[style.--popup-height.px]': 'size()?.height'
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
    private previousElement: HTMLElement | null = null;
    private pendingDirection: string | undefined;
    private cleanupTimer: ReturnType<typeof setTimeout> | undefined;
    private readonly resizeObserver =
        typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.measure()) : null;

    private readonly activeContent = computed(() => this.rootContext.activeContent());

    constructor() {
        const unregister = this.rootContext.registerViewport((previous, next) => {
            this.pendingDirection = getActivationDirection(previous, next);
        });

        effect(() => {
            const entry = this.activeContent();
            untracked(() => this.render(entry));
        });

        inject(DestroyRef).onDestroy(() => {
            unregister();
            this.resizeObserver?.disconnect();
            this.clearCleanupTimer();
            this.removePrevious();
            this.current?.view.destroy();
        });
    }

    private render(entry: RdxNavigationMenuContentEntry | undefined) {
        if (!entry) {
            return;
        }

        if (this.current?.value === entry.value) {
            return;
        }

        // Snapshot the outgoing content so it can animate out as `data-previous`.
        if (this.current) {
            this.resizeObserver?.unobserve(this.current.measureTarget);
            this.startLeave(this.current.element);
            this.current.view.destroy();
        }

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

        this.current = { value: entry.value, view, element, measureTarget };
        this.resizeObserver?.observe(measureTarget);
        this.measure();
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
            this.size.set({ width, height });
        }
    }
}
