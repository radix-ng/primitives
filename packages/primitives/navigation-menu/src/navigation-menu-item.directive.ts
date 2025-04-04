import { Directive, ElementRef, inject, input, Signal, signal } from '@angular/core';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { focusFirst, getTabbableCandidates, removeFromTabOrder } from './utils';

@Directive({
    selector: '[rdxNavigationMenuItem]',
    host: {
        '[attr.value]': 'value()'
    },
    exportAs: 'rdxNavigationMenuItem'
})
export class RdxNavigationMenuItemDirective {
    readonly elementRef = inject(ElementRef);
    private readonly context = injectNavigationMenu();

    readonly value = input('');

    readonly triggerRef = signal<HTMLElement | null>(null);
    readonly contentRef = signal<HTMLElement | null>(null);
    readonly focusProxyRef = signal<HTMLElement | null>(null);
    readonly wasEscapeCloseRef = signal(false);

    private readonly _restoreContentTabOrderRef = signal<(() => void) | null>(null);

    get restoreContentTabOrderRef(): Signal<(() => void) | null> {
        return this._restoreContentTabOrderRef;
    }

    /**
     * Handle keyboard entry into content from trigger
     */
    onEntryKeyDown() {
        // Check if we're using a viewport in a root menu
        if (isRootNavigationMenu(this.context) && this.context.viewport && this.context.viewport()) {
            const viewport = this.context.viewport();
            if (viewport) {
                // Find tabbable elements in the viewport
                const candidates = getTabbableCandidates(viewport);
                if (candidates.length) {
                    // Make sure all elements are in the tab order
                    this.ensureTabOrder();

                    // Focus the first element
                    focusFirst(candidates);
                    return;
                }
            }
        }

        // Fallback to content if no viewport or no tabbable elements in viewport
        if (this.contentRef()) {
            // restore tab order if needed
            const restoreFn = this._restoreContentTabOrderRef();
            if (restoreFn) restoreFn();

            // find and focus first tabbable element
            const candidates = getTabbableCandidates(this.contentRef()!);
            if (candidates.length) {
                focusFirst(candidates);
            }
        }
    }

    /**
     * Ensure elements are in the tab order by restoring any previously removed tabindex values
     */
    private ensureTabOrder(): void {
        const restoreFn = this._restoreContentTabOrderRef();
        if (restoreFn) {
            restoreFn();
            this._restoreContentTabOrderRef.set(null);
        }
    }

    /**
     * Handle focus coming from the focus proxy element
     * @param side Which side the focus is coming from (start = from trigger, end = from after content)
     */
    onFocusProxyEnter(side: 'start' | 'end' = 'start') {
        // Check for viewport first
        if (isRootNavigationMenu(this.context) && this.context.viewport && this.context.viewport()) {
            const viewport = this.context.viewport();
            if (viewport) {
                const candidates = getTabbableCandidates(viewport);
                if (candidates.length) {
                    this.ensureTabOrder();

                    // Focus first or last element depending on direction
                    focusFirst(side === 'start' ? candidates : [...candidates].reverse());
                    return;
                }
            }
        }

        // Fallback to content
        if (this.contentRef()) {
            // restore tab order if needed
            const restoreFn = this._restoreContentTabOrderRef();
            if (restoreFn) restoreFn();

            // find and focus appropriate element based on direction
            const candidates = getTabbableCandidates(this.contentRef()!);
            if (candidates.length) {
                // Focus first or last element depending on which direction we're coming from
                focusFirst(side === 'start' ? candidates : [...candidates].reverse());
            }
        }
    }

    /**
     * Handle focus moving outside of the content
     * Remove elements from tab order when not focused
     */
    onContentFocusOutside() {
        // Get all tabbable elements from both viewport and content
        let allCandidates: HTMLElement[] = [];

        // Check viewport first
        if (isRootNavigationMenu(this.context) && this.context.viewport && this.context.viewport()) {
            const viewport = this.context.viewport();
            if (viewport) {
                allCandidates = getTabbableCandidates(viewport);
            }
        }

        // Also check direct content
        if (this.contentRef()) {
            const contentCandidates = getTabbableCandidates(this.contentRef()!);
            allCandidates = [...allCandidates, ...contentCandidates];
        }

        // Remove from tab order and store restore function
        if (allCandidates.length) {
            this._restoreContentTabOrderRef.set(removeFromTabOrder(allCandidates));
        }
    }

    /**
     * Handle content being closed from root menu
     */
    onRootContentClose() {
        this.onContentFocusOutside();
    }
}
