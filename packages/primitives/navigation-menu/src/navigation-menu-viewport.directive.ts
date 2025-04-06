import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    EmbeddedViewRef,
    inject,
    input,
    OnDestroy,
    OnInit,
    Renderer2,
    signal,
    TemplateRef,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { ARROW_DOWN, ARROW_UP } from '@radix-ng/primitives/core';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { getOpenStateLabel, getTabbableCandidates } from './utils';

interface ContentNode {
    embeddedView: EmbeddedViewRef<unknown>;
    element: HTMLElement;
}

@Directive({
    selector: '[rdxNavigationMenuViewport]',
    host: {
        '[attr.data-state]': 'getOpenState()',
        '[attr.data-orientation]': 'context.orientation',
        '[style.--radix-navigation-menu-viewport-width.px]': 'viewportSize()?.width',
        '[style.--radix-navigation-menu-viewport-height.px]': 'viewportSize()?.height',
        '(keydown)': 'onKeydown($event)',
        '(pointerenter)': 'onPointerEnter()',
        '(pointerleave)': 'onPointerLeave()'
    }
})
export class RdxNavigationMenuViewportDirective implements OnInit, OnDestroy {
    private readonly context = injectNavigationMenu();
    private readonly doc = inject(DOCUMENT);

    private readonly elementRef = inject(ElementRef);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly renderer = inject(Renderer2);

    /**
     * Used to keep the viewport rendered and available in the DOM, even when closed.
     * Useful for animations.
     * @default false
     */
    readonly forceMount = input<BooleanInput, unknown>(undefined, { transform: booleanAttribute });

    private readonly _contentNodes = signal(new Map<string, ContentNode>());
    private readonly _activeContentNode = signal<ContentNode | null>(null);
    private readonly _viewportSize = signal<{ width: number; height: number } | null>(null);
    private readonly _resizeObserver = new ResizeObserver(() => this.updateSize());

    // compute the active content value - either current value if open, or previous value if closing
    readonly activeContentValue = computed(() => {
        return this.open ? this.context.value() : this.context.previousValue();
    });

    // size for viewport CSS variables
    readonly viewportSize = computed(() => this._viewportSize());

    get open(): boolean {
        return Boolean(this.context.value() || this.forceMount());
    }

    onKeydown(event: KeyboardEvent): void {
        // only handle if viewport is open
        if (!this.open) return;

        // get all tabbable elements in the viewport
        const tabbableElements = getTabbableCandidates(this.elementRef.nativeElement);
        if (!tabbableElements.length) return;

        // find the currently focused element
        const activeElement = this.doc.activeElement as HTMLElement | null;
        const currentIndex = tabbableElements.findIndex((el) => el === activeElement);

        if (event.key === ARROW_DOWN) {
            event.preventDefault();

            if (currentIndex >= 0 && currentIndex < tabbableElements.length - 1) {
                // focus the next element
                tabbableElements[currentIndex + 1].focus();
            } else if (currentIndex === -1 || currentIndex === tabbableElements.length - 1) {
                // if no element is focused or we're at the end, focus the first element
                tabbableElements[0].focus();
            }
        } else if (event.key === ARROW_UP) {
            event.preventDefault();

            if (currentIndex > 0) {
                // focus the previous element
                tabbableElements[currentIndex - 1].focus();
            } else if (currentIndex === 0) {
                // if at the first element, loop to the last element
                tabbableElements[tabbableElements.length - 1].focus();
            } else if (currentIndex === -1) {
                // if no element is focused, focus the last element
                tabbableElements[tabbableElements.length - 1].focus();
            }
        }
    }

    constructor() {
        // setup effect to manage content
        effect(() => {
            const activeValue = this.activeContentValue();
            const open = this.open;

            untracked(() => {
                // handle visibility based on open state
                this.renderer.setStyle(this.elementRef.nativeElement, 'display', open ? 'block' : 'none');

                if (isRootNavigationMenu(this.context) && this.context.viewportContent) {
                    const viewportContent = this.context.viewportContent();

                    if (viewportContent.has(activeValue)) {
                        const contentData = viewportContent.get(activeValue);

                        // only render content when we have a templateRef
                        if (contentData?.templateRef) {
                            this.renderContent(contentData.templateRef, activeValue);
                        }
                    }
                }
            });
        });
    }

    ngOnInit() {
        // register viewport with context
        if (isRootNavigationMenu(this.context) && this.context.onViewportChange) {
            this.context.onViewportChange(this.elementRef.nativeElement);
        }
    }

    ngOnDestroy() {
        this._resizeObserver.disconnect();

        // clear all views
        this._contentNodes().forEach((node) => {
            if (node.embeddedView) {
                node.embeddedView.destroy();
            }
        });

        // unregister viewport
        if (isRootNavigationMenu(this.context) && this.context.onViewportChange) {
            this.context.onViewportChange(null);
        }
    }

    getOpenState() {
        return getOpenStateLabel(this.open);
    }

    onPointerEnter(): void {
        if (isRootNavigationMenu(this.context) && this.context.onContentEnter) {
            this.context.onContentEnter();
        }

        // update pointer tracking state
        if (isRootNavigationMenu(this.context) && this.context.setContentPointerState) {
            this.context.setContentPointerState(true);
        }
    }

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

        // force layout recalculation while keeping element in the DOM
        window.getComputedStyle(activeNode).getPropertyValue('width');

        const firstChild = activeNode.firstChild as HTMLElement;
        const width = Math.ceil(firstChild.offsetWidth);
        const height = Math.ceil(firstChild.offsetHeight);

        // update size with valid dimensions (but only if not zero)
        if (width !== 0 && height !== 0) {
            this._viewportSize.set({ width, height });
        }
    }

    private renderContent(templateRef: TemplateRef<unknown>, contentValue: string) {
        // check if we already have a view for this content
        let contentNode = this._contentNodes().get(contentValue);

        if (!contentNode) {
            try {
                // create a new embedded view
                const embeddedView = this.viewContainerRef.createEmbeddedView(templateRef);
                embeddedView.detectChanges();

                // create a container for the view
                const container = this.renderer.createElement('div');
                this.renderer.setAttribute(container, 'class', 'NavigationMenuContentWrapper');
                this.renderer.setAttribute(container, 'data-content-value', contentValue);
                this.renderer.setStyle(container, 'width', '100%');

                const viewportContent = this.context.viewportContent && this.context.viewportContent();
                if (!viewportContent) return;

                const contentData = viewportContent.get(contentValue);

                // apply motion attribute if available
                if (contentData?.getMotionAttribute) {
                    const motionAttr = contentData.getMotionAttribute();
                    if (motionAttr) {
                        this.renderer.setAttribute(container, 'data-motion', motionAttr);
                    }
                }

                // apply additional a11y attributes to the first root node
                if (contentData?.additionalAttrs && embeddedView.rootNodes.length > 0) {
                    const rootNode = embeddedView.rootNodes[0];
                    // check if rootNode has setAttribute (is an Element)
                    if (rootNode.setAttribute) {
                        Object.entries(contentData.additionalAttrs).forEach(([attr, value]) => {
                            // don't override existing attributes that the user might have set manually
                            if (!rootNode.hasAttribute(attr) || attr === 'id') {
                                this.renderer.setAttribute(rootNode, attr, value as string);
                            }
                        });
                    }
                }

                // add each root node to the container
                embeddedView.rootNodes.forEach((node: Node) => {
                    this.renderer.appendChild(container, node);
                });

                // set styles for proper measurement and display
                this.renderer.setStyle(container, 'position', 'relative');
                this.renderer.setStyle(container, 'visibility', 'visible');
                this.renderer.setStyle(container, 'pointer-events', 'auto');
                this.renderer.setStyle(container, 'display', 'block');

                // store in cache
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

    private updateActiveContent(contentNode: ContentNode) {
        if (contentNode !== this._activeContentNode()) {
            // clear viewport
            while (this.elementRef.nativeElement.firstChild) {
                this.renderer.removeChild(this.elementRef.nativeElement, this.elementRef.nativeElement.firstChild);
            }

            // add content to viewport
            this.renderer.appendChild(this.elementRef.nativeElement, contentNode.element);

            // update active content reference
            this._activeContentNode.set(contentNode);

            // setup resize observation
            this._resizeObserver.disconnect();
            this._resizeObserver.observe(contentNode.element);

            // measure after adding to DOM
            setTimeout(() => this.updateSize(), 0);

            // measure again after a frame to catch any style changes
            requestAnimationFrame(() => this.updateSize());
        }
    }
}
