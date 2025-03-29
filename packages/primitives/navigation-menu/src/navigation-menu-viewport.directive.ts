import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterViewInit,
    Directive,
    ElementRef,
    HostListener,
    inject,
    Input,
    OnDestroy,
    Renderer2,
    signal
} from '@angular/core';
import { injectNavigationMenu, isNavigationMenuRoot } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuViewport]',
    standalone: true,
    host: {
        '[attr.data-state]': 'getOpenState()',
        '[attr.data-orientation]': 'context.orientation',
        '[style.--radix-navigation-menu-viewport-width]': 'viewportWidth',
        '[style.--radix-navigation-menu-viewport-height]': 'viewportHeight'
    }
})
export class RdxNavigationMenuViewportDirective implements AfterViewInit, OnDestroy {
    protected readonly context = injectNavigationMenu();
    protected readonly elementRef = inject(ElementRef);
    protected readonly renderer = inject(Renderer2);

    /** Whether to force mount the viewport */
    @Input({ transform: coerceBooleanProperty }) forceMount: BooleanInput;

    /** The current size of the viewport */
    private size = signal<{ width: number; height: number } | null>(null);

    /** The current active content element */
    private content = signal<HTMLElement | null>(null);

    /** The current viewport width */
    get viewportWidth(): string | undefined {
        return this.size() ? `${this.size()!.width}px` : undefined;
    }

    /** The current viewport height */
    get viewportHeight(): string | undefined {
        return this.size() ? `${this.size()!.height}px` : undefined;
    }

    /** Whether the viewport is open */
    get open(): boolean {
        return Boolean(this.context.value());
    }

    /** The active content value */
    get activeContentValue(): string {
        if (isNavigationMenuRoot(this.context)) {
            return this.open ? this.context.value() : this.context.previousValue();
        }
        return this.context.value();
    }

    /** ResizeObserver for tracking content size changes */
    private resizeObserver: ResizeObserver | null = null;
    private interval: number | null = null;
    private activeClone: HTMLElement | null = null;

    ngAfterViewInit() {
        // Setup resize observer
        this.resizeObserver = new ResizeObserver(() => {
            this.updateSize();
        });

        // Register the viewport with the context
        if (isNavigationMenuRoot(this.context)) {
            // Use type assertion to access the internal signal
            (this.context as any).viewport?.set(this.elementRef.nativeElement);
        }

        // Watch for viewport content changes
        if (isNavigationMenuRoot(this.context)) {
            // Set up periodic check for content changes
            this.interval = window.setInterval(() => {
                this.updateContent();
            }, 100);
        }
    }

    ngOnDestroy() {
        this.resizeObserver?.disconnect();

        if (this.interval) {
            window.clearInterval(this.interval);
        }

        // Unregister viewport
        if (isNavigationMenuRoot(this.context)) {
            (this.context as any).viewport?.set(null);
        }
    }

    @HostListener('pointerenter')
    onPointerEnter(): void {
        if (isNavigationMenuRoot(this.context) && 'onContentEnter' in this.context) {
            this.context.onContentEnter();
        }
    }

    @HostListener('pointerleave')
    onPointerLeave(): void {
        if (isNavigationMenuRoot(this.context) && 'onContentLeave' in this.context) {
            this.context.onContentLeave();
        }
    }

    /**
     * Get the open state for the data-state attribute
     */
    getOpenState(): string {
        return this.open ? 'open' : 'closed';
    }

    /**
     * Update the active content element
     */
    private updateContent(): void {
        if (!isNavigationMenuRoot(this.context)) return;

        const activeValue = this.activeContentValue;
        const viewportContent = this.context.viewportContent();

        if (viewportContent.has(activeValue)) {
            const contentData = viewportContent.get(activeValue);
            if (contentData && contentData.ref) {
                const sourceElement = contentData.ref.nativeElement;

                // Only update if this is a new content element
                if (sourceElement !== this.content()) {
                    // Clean up previous content clone
                    if (this.activeClone) {
                        this.renderer.removeChild(this.elementRef.nativeElement, this.activeClone);
                    }

                    // Clone the content node for display in the viewport
                    // We need to clone it because the original is hidden in the DOM
                    const clone = sourceElement.cloneNode(true) as HTMLElement;
                    this.renderer.setStyle(clone, 'position', 'absolute');
                    this.renderer.setStyle(clone, 'top', '0');
                    this.renderer.setStyle(clone, 'left', '0');
                    this.renderer.appendChild(this.elementRef.nativeElement, clone);

                    // Store references
                    this.activeClone = clone;
                    this.content.set(sourceElement);

                    // Observe for size changes
                    this.resizeObserver?.disconnect();
                    this.resizeObserver?.observe(clone);

                    // Update size immediately
                    this.updateSize();
                }
            }
        }
    }

    /**
     * Update the size of the viewport based on the content
     */
    private updateSize(): void {
        if (!this.activeClone) return;

        this.size.set({
            width: this.activeClone.offsetWidth,
            height: this.activeClone.offsetHeight
        });
    }
}
