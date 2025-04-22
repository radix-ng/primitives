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
    NgZone,
    OnDestroy,
    OnInit,
    Renderer2,
    signal,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ARROW_DOWN, ARROW_UP, injectDocument, injectWindow } from '@radix-ng/primitives/core';
import { TransitionOptions, TransitionStartFn, usePresence } from '@radix-ng/primitives/presence';
import { Subscription } from 'rxjs';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { getOpenStateLabel, getTabbableCandidates } from './utils';

interface ContentNode {
    embeddedView: EmbeddedViewRef<unknown>;
    element: HTMLElement;
    contentValue: string;
    state: 'open' | 'closed';
    transitionSubscription?: Subscription | null;
}

@Directive({
    selector: '[rdxNavigationMenuViewport]',
    host: {
        '[attr.data-state]': 'dataState()',
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
    private readonly document = injectDocument();
    private readonly window = injectWindow();
    private readonly elementRef = inject(ElementRef);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly renderer = inject(Renderer2);
    private readonly zone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);

    /**
     * Used to keep the viewport rendered and available in the DOM, even when closed.
     * Useful for animations.
     * @default false
     */
    readonly forceMount = input(false, { transform: booleanAttribute });

    private readonly _contentNodes = signal(new Map<string, ContentNode>());
    private readonly _activeContentNode = signal<ContentNode | null>(null);
    private readonly _leavingContentNode = signal<ContentNode | null>(null);
    private readonly _viewportSize = signal<{ width: number; height: number } | null>(null);

    readonly activeContentValue = computed(() => {
        if (!isRootNavigationMenu(this.context)) return null;
        return this.context.value() || this.context.previousValue();
    });
    readonly isOpen = computed(() => {
        if (!isRootNavigationMenu(this.context)) return false;
        return Boolean(this.context.value() || this.forceMount());
    });
    readonly dataState = computed(() => getOpenStateLabel(this.isOpen()));
    readonly viewportSize = computed(() => this._viewportSize());

    private readonly _resizeObserver = new ResizeObserver(() => this.updateSize());

    constructor() {
        this.setupViewportEffect();
    }

    ngOnInit() {
        if (isRootNavigationMenu(this.context) && this.context.onViewportChange) {
            this.context.onViewportChange(this.elementRef.nativeElement);
        }
    }

    ngOnDestroy() {
        this._resizeObserver.disconnect();
        // clean up any remaining nodes/views/subscriptions
        this._contentNodes().forEach((node) => this.cleanupAfterLeave(node));
        if (isRootNavigationMenu(this.context) && this.context.onViewportChange) {
            this.context.onViewportChange(null);
        }
    }

    onKeydown(event: KeyboardEvent): void {
        if (!this.isOpen()) return;
        const tabbableElements = getTabbableCandidates(this.elementRef.nativeElement);
        if (!tabbableElements.length) return;
        const activeElement = this.document.activeElement as HTMLElement | null;
        const currentIndex = tabbableElements.findIndex((el) => el === activeElement);

        if (event.key === ARROW_DOWN) {
            event.preventDefault();
            const nextIndex = currentIndex >= 0 && currentIndex < tabbableElements.length - 1 ? currentIndex + 1 : 0;
            tabbableElements[nextIndex]?.focus();
        } else if (event.key === ARROW_UP) {
            event.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabbableElements.length - 1;
            tabbableElements[prevIndex]?.focus();
        }
    }

    onPointerEnter(): void {
        if (isRootNavigationMenu(this.context) && this.context.onContentEnter) {
            this.context.onContentEnter();
        }
        if (isRootNavigationMenu(this.context) && this.context.setContentPointerState) {
            this.context.setContentPointerState(true);
        }
    }

    onPointerLeave(): void {
        if (isRootNavigationMenu(this.context) && this.context.onContentLeave) {
            this.context.onContentLeave();
        }
        if (isRootNavigationMenu(this.context) && this.context.setContentPointerState) {
            this.context.setContentPointerState(false);
        }
    }

    private setupViewportEffect(): void {
        effect(() => {
            const currentActiveValue = this.context.value();
            const previousActiveValue = this.context.previousValue();
            const forceMount = this.forceMount();

            untracked(() => {
                // ensure context is root before proceeding
                if (!isRootNavigationMenu(this.context) || !this.context.viewportContent) {
                    return;
                }

                const allContentData = this.context.viewportContent();
                const currentNodesMap = this._contentNodes();
                let enteringNode: ContentNode | null = null;
                let leavingNode = this._leavingContentNode(); // get potentially already leaving node

                // 1. Identify Entering Node
                if (currentActiveValue && allContentData.has(currentActiveValue)) {
                    enteringNode = this.getOrCreateContentNode(currentActiveValue);
                }

                // 2. Identify Leaving Node
                const nodeThatWasActive = previousActiveValue ? currentNodesMap.get(previousActiveValue) : null;
                // if there was a previously active node, it's different from the entering one,
                // and it's not already leaving, mark it for removal.
                if (nodeThatWasActive && nodeThatWasActive !== enteringNode && nodeThatWasActive !== leavingNode) {
                    // if another node was already leaving, force complete its transition
                    if (leavingNode) {
                        this.forceCompleteLeaveTransition(leavingNode);
                    }
                    leavingNode = nodeThatWasActive;
                    this._leavingContentNode.set(leavingNode);
                }

                // 3. Handle Entering Node
                if (enteringNode) {
                    // cancel any pending leave transition for this node if it was leaving
                    if (enteringNode === leavingNode) {
                        this.cancelLeaveTransition(enteringNode);
                        leavingNode = null;
                        this._leavingContentNode.set(null);
                    }
                    // ensure it's in the DOM and set state to open
                    this.addNodeToDOM(enteringNode);
                    this.setNodeState(enteringNode, 'open'); // Triggers enter animation via data-state
                    this._activeContentNode.set(enteringNode);
                    this.updateSize(); // Update size based on the entering node
                } else {
                    // no node entering, clear active node state
                    this._activeContentNode.set(null);
                }

                // 4. Handle Leaving Node
                if (leavingNode) {
                    if (forceMount) {
                        // if forceMount, just mark as closed, don't trigger removal animation
                        this.setNodeState(leavingNode, 'closed');
                        this._leavingContentNode.set(null); // No longer considered "leaving"
                    } else {
                        // start the leave transition (usePresence handles DOM removal)
                        this.startLeaveTransition(leavingNode);
                    }
                }
            });
        });
    }

    // gets or creates the ContentNode (wrapper + view)
    private getOrCreateContentNode(contentValue: string): ContentNode | null {
        const existingNode = this._contentNodes().get(contentValue);
        if (existingNode && !existingNode.embeddedView.destroyed) {
            return existingNode;
        }

        // create if doesn't exist or view was destroyed
        if (!isRootNavigationMenu(this.context) || !this.context.viewportContent) return null;
        const allContentData = this.context.viewportContent();
        const contentData = allContentData.get(contentValue);
        const templateRef = contentData?.templateRef;

        if (!templateRef) {
            console.error(`No templateRef found for content value: ${contentValue}`);
            return null;
        }

        try {
            const embeddedView = this.viewContainerRef.createEmbeddedView(templateRef);
            const container = this.renderer.createElement('div');
            this.renderer.setAttribute(container, 'class', 'NavigationMenuContentWrapper');
            this.renderer.setAttribute(container, 'data-content-value', contentValue);
            embeddedView.rootNodes.forEach((node: Node) => this.renderer.appendChild(container, node));

            const newNode: ContentNode = {
                embeddedView,
                element: container,
                contentValue,
                state: 'closed'
            };

            const newMap = new Map(this._contentNodes());
            newMap.set(contentValue, newNode);
            this._contentNodes.set(newMap);
            return newNode;
        } catch (error) {
            console.error(`Error creating content node for ${contentValue}:`, error);
            return null;
        }
    }

    // adds node element to viewport DOM if not already present
    private addNodeToDOM(node: ContentNode): void {
        if (!this.elementRef.nativeElement.contains(node.element)) {
            this.renderer.appendChild(this.elementRef.nativeElement, node.element);
            // observe size only when added to DOM
            this._resizeObserver.observe(node.element);
        }
    }

    // removes node element from viewport DOM
    private removeNodeFromDOM(node: ContentNode): void {
        if (this.elementRef.nativeElement.contains(node.element)) {
            this._resizeObserver.unobserve(node.element); // stop observing before removal
            this.renderer.removeChild(this.elementRef.nativeElement, node.element);
        }
    }

    // updates the data-state and motion attributes
    private setNodeState(node: ContentNode, state: 'open' | 'closed'): void {
        if (node.state === state) return; // avoid redundant updates

        node.state = state;
        this.renderer.setAttribute(node.element, 'data-state', state);

        // apply motion attribute based on context
        if (isRootNavigationMenu(this.context) && this.context.viewportContent) {
            const contentData = this.context.viewportContent().get(node.contentValue);
            if (contentData?.getMotionAttribute) {
                // get motion based on current state transition
                const motionAttr = contentData.getMotionAttribute();
                if (motionAttr) {
                    this.renderer.setAttribute(node.element, 'data-motion', motionAttr);
                } else {
                    this.renderer.removeAttribute(node.element, 'data-motion');
                }
            } else {
                this.renderer.removeAttribute(node.element, 'data-motion');
            }
        }

        // apply A11y attributes (might only be needed on open?)
        if (state === 'open') {
            this.applyA11yAttributes(node);
        }
    }

    // apply A11y attributes to the first child element
    private applyA11yAttributes(node: ContentNode): void {
        if (!isRootNavigationMenu(this.context) || !this.context.viewportContent) return;
        const contentData = this.context.viewportContent().get(node.contentValue);
        if (contentData?.additionalAttrs && node.embeddedView.rootNodes.length > 0) {
            const firstRootNode = node.embeddedView.rootNodes[0] as Element;
            if (firstRootNode) {
                Object.entries(contentData.additionalAttrs).forEach(([attr, value]) => {
                    this.renderer.setAttribute(firstRootNode, attr, value as string);
                });
            }
        }
    }

    private startLeaveTransition(node: ContentNode): void {
        // ensure node exists and isn't already leaving with an active subscription
        if (!node || node.transitionSubscription) {
            node.transitionSubscription?.unsubscribe();
            return;
        }

        const startFn: TransitionStartFn<null> = () => {
            this.setNodeState(node, 'closed');
            return () => this.cleanupAfterLeave(node);
        };

        const options: TransitionOptions<null> = {
            animation: true, // assuming CSS animations/transitions handle the exit
            state: 'continue' // start the leave process
        };

        node.transitionSubscription = usePresence(this.zone, node.element, startFn, options)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                complete: () => {
                    this.cleanupAfterLeave(node);
                }
            });
    }

    /**
     * Cleanup function called after leave animation finishes
     * @param node The node that is leaving
     */
    private cleanupAfterLeave(node: ContentNode): void {
        // check if this node is still marked as the one leaving
        if (this._leavingContentNode() === node) {
            this.removeNodeFromDOM(node);
            if (!this.forceMount() && node.embeddedView && !node.embeddedView.destroyed) {
                node.embeddedView.destroy();
                // Remove from cache if destroyed
                const newMap = new Map(this._contentNodes());
                newMap.delete(node.contentValue);
                this._contentNodes.set(newMap);
            }

            node.transitionSubscription = null;
            this._leavingContentNode.set(null);
        } else {
            // if this node is NOT the one currently marked as leaving, it means
            // a new transition started before this one finished. Just clean up DOM/Sub.
            this.removeNodeFromDOM(node);
            node.transitionSubscription?.unsubscribe();
            node.transitionSubscription = null;
        }
    }

    /**
     * Cancels an ongoing leave transition (e.g., if user hovers back)
     * @param node The node that is leaving
     */
    private cancelLeaveTransition(node: ContentNode): void {
        node.transitionSubscription?.unsubscribe();
        node.transitionSubscription = null;
    }

    /**
     * Force completes a leave transition (e.g., if another leave starts)
     * @param node The node that is leaving
     */
    private forceCompleteLeaveTransition(node: ContentNode): void {
        if (node && node.transitionSubscription) {
            node.transitionSubscription.unsubscribe();

            // perform cleanup immediately
            this.cleanupAfterLeave(node);
        }
    }

    private updateSize() {
        const activeNode = this._activeContentNode()?.element; // measure the currently active node
        if (!activeNode || !activeNode.isConnected) return;

        const firstChild = activeNode.firstChild as HTMLElement;
        if (!firstChild) return;

        this.window.requestAnimationFrame(() => {
            // keep rAF here for measurement stability
            activeNode.getBoundingClientRect(); // force layout
            const width = Math.ceil(firstChild.offsetWidth);
            const height = Math.ceil(firstChild.offsetHeight);

            if (width !== 0 || height !== 0) {
                const currentSize = this._viewportSize();
                if (!currentSize || currentSize.width !== width || currentSize.height !== height) {
                    this._viewportSize.set({ width, height });
                }
            } else if (this._viewportSize() !== null) {
                this._viewportSize.set(null);
            }
        });
    }
}
