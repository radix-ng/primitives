import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    HostListener,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Renderer2,
    signal,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { getOpenState } from './utils';

@Directive({
    selector: '[rdxNavigationMenuViewport]',
    standalone: true,
    host: {
        '[attr.data-state]': 'getOpenState()',
        '[attr.data-orientation]': 'context.orientation',
        '[style.--radix-navigation-menu-viewport-width.px]': 'viewportSize()?.width',
        '[style.--radix-navigation-menu-viewport-height.px]': 'viewportSize()?.height'
    }
})
export class RdxNavigationMenuViewportDirective implements OnInit, OnDestroy {
    private readonly context = injectNavigationMenu();
    private readonly elementRef = inject(ElementRef);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly renderer = inject(Renderer2);

    @Input({ transform: booleanAttribute }) forceMount: BooleanInput;

    private readonly _contentNodes = signal(new Map<string, { embeddedView: any; element: HTMLElement }>());
    private readonly _activeContentNode = signal<{ embeddedView: any; element: HTMLElement } | null>(null);
    private readonly _viewportSize = signal<{ width: number; height: number } | null>(null);
    private readonly _resizeObserver = new ResizeObserver(() => this.updateSize());

    // Compute the active content value - either current value if open, or previous value if closing
    readonly activeContentValue = computed(() => {
        return this.open ? this.context.value() : this.context.previousValue();
    });

    // Size for viewport CSS variables
    readonly viewportSize = computed(() => this._viewportSize());

    // Open state
    get open(): boolean {
        return Boolean(this.context.value() || this.forceMount);
    }

    constructor() {
        // Setup effect to manage content
        effect(() => {
            const activeValue = this.activeContentValue();
            const open = this.open;

            untracked(() => {
                // Handle visibility based on open state
                this.renderer.setStyle(this.elementRef.nativeElement, 'display', open ? 'block' : 'none');

                if (isRootNavigationMenu(this.context) && this.context.viewportContent) {
                    const viewportContent = this.context.viewportContent();

                    if (viewportContent.has(activeValue)) {
                        const contentData = viewportContent.get(activeValue);

                        // We should only render content when we have a templateRef
                        if (contentData?.templateRef) {
                            this.renderContent(contentData.templateRef, activeValue);
                        }
                    }
                }
            });
        });
    }

    ngOnInit() {
        // Register viewport with context
        if (isRootNavigationMenu(this.context) && this.context.onViewportChange) {
            this.context.onViewportChange(this.elementRef.nativeElement);
        }
    }

    ngOnDestroy() {
        this._resizeObserver.disconnect();

        // Clear all views
        this._contentNodes().forEach((node) => {
            if (node.embeddedView) {
                node.embeddedView.destroy();
            }
        });

        // Unregister viewport
        if (isRootNavigationMenu(this.context) && this.context.onViewportChange) {
            this.context.onViewportChange(null);
        }
    }

    getOpenState() {
        return getOpenState(this.open);
    }

    @HostListener('pointerenter')
    onPointerEnter(): void {
        if (isRootNavigationMenu(this.context) && this.context.onContentEnter) {
            this.context.onContentEnter();
        }

        // Update pointer tracking state
        if (isRootNavigationMenu(this.context) && this.context.setContentPointerState) {
            this.context.setContentPointerState(true);
        }
    }

    @HostListener('pointerleave')
    onPointerLeave(): void {
        if (isRootNavigationMenu(this.context) && this.context.onContentLeave) {
            this.context.onContentLeave();
        }

        // Update pointer tracking state
        if (isRootNavigationMenu(this.context) && this.context.setContentPointerState) {
            this.context.setContentPointerState(false);
        }
    }

    private updateSize() {
        const activeNode = this._activeContentNode()?.element;
        if (!activeNode) return;

        // Force layout recalculation while keeping element in the DOM
        window.getComputedStyle(activeNode).getPropertyValue('width');

        const firstChild = activeNode.firstChild as HTMLElement;
        const width = Math.ceil(firstChild.offsetWidth);
        const height = Math.ceil(firstChild.offsetHeight);

        // Update size with valid dimensions (but only if not zero)
        if (width !== 0 && height !== 0) {
            this._viewportSize.set({ width, height });
        }
    }

    private renderContent(templateRef: any, contentValue: string) {
        // Check if we already have a view for this content
        let contentNode = this._contentNodes().get(contentValue);

        if (!contentNode) {
            try {
                // Create a new embedded view
                const embeddedView = this.viewContainerRef.createEmbeddedView(templateRef);
                embeddedView.detectChanges();

                // Create a container for the view
                const container = this.renderer.createElement('div');
                this.renderer.setAttribute(container, 'class', 'NavigationMenuContentWrapper');
                this.renderer.setAttribute(container, 'data-content-value', contentValue);
                this.renderer.setStyle(container, 'width', '100%');

                // Add motion attribute for animations
                const viewportContent = this.context.viewportContent && this.context.viewportContent();
                if (!viewportContent) return;
                const contentData = viewportContent.get(contentValue);
                if (contentData?.getMotionAttribute) {
                    const motionAttr = contentData.getMotionAttribute();
                    if (motionAttr) {
                        this.renderer.setAttribute(container, 'data-motion', motionAttr);
                    }
                }

                // Add each root node to the container
                embeddedView.rootNodes.forEach((node: Node) => {
                    this.renderer.appendChild(container, node);
                });

                // Set styles for proper measurement and display
                this.renderer.setStyle(container, 'position', 'relative');
                this.renderer.setStyle(container, 'visibility', 'visible');
                this.renderer.setStyle(container, 'pointer-events', 'auto');
                this.renderer.setStyle(container, 'display', 'block');

                // Store in cache
                contentNode = { embeddedView, element: container };
                const newMap = new Map(this._contentNodes());
                newMap.set(contentValue, contentNode);
                this._contentNodes.set(newMap);
            } catch (error) {
                console.error('Error in renderContent:', error);
                return;
            }
        }

        if (contentNode) {
            this.updateActiveContent(contentNode);
        }
    }

    updateActiveContent(contentNode: { embeddedView: any; element: HTMLElement }) {
        if (contentNode !== this._activeContentNode()) {
            // Clear viewport
            while (this.elementRef.nativeElement.firstChild) {
                this.renderer.removeChild(this.elementRef.nativeElement, this.elementRef.nativeElement.firstChild);
            }

            // Add content to viewport
            this.renderer.appendChild(this.elementRef.nativeElement, contentNode.element);

            // Update active content reference
            this._activeContentNode.set(contentNode);

            // Setup resize observation
            this._resizeObserver.disconnect();
            this._resizeObserver.observe(contentNode.element);

            // Measure after adding to DOM
            setTimeout(() => this.updateSize(), 0);

            // Measure again after a frame to catch any style changes
            requestAnimationFrame(() => this.updateSize());
        }
    }
}
