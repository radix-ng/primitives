import { FocusableOption } from '@angular/cdk/a11y';
import { contentChild, Directive, ElementRef, inject, input, Signal, signal } from '@angular/core';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { RdxNavigationMenuFocusableOption } from './navigation-menu.types';
import { focusFirst, getTabbableCandidates, removeFromTabOrder } from './utils';

@Directive({
    selector: '[rdxNavigationMenuItem]',
    host: {
        '[attr.value]': 'value()'
    },
    exportAs: 'rdxNavigationMenuItem'
})
export class RdxNavigationMenuItemDirective implements FocusableOption {
    readonly elementRef = inject(ElementRef);
    private readonly context = injectNavigationMenu();

    readonly value = input('');

    /**
     * @ignore
     */
    readonly triggerOrLink = contentChild(RdxNavigationMenuFocusableOption);

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
                // find tabbable elements in the viewport
                const candidates = getTabbableCandidates(viewport);
                if (candidates.length) {
                    this.ensureTabOrder();

                    // focus the first element
                    focusFirst(candidates);
                    return;
                }
            }
        }

        // fallback to content if no viewport or no tabbable elements in viewport
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

    focus(): void {
        this.triggerOrLink()?.focus();
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
        // check for viewport first
        if (isRootNavigationMenu(this.context) && this.context.viewport && this.context.viewport()) {
            const viewport = this.context.viewport();
            if (viewport) {
                const candidates = getTabbableCandidates(viewport);
                if (candidates.length) {
                    this.ensureTabOrder();

                    // focus first or last element depending on direction
                    focusFirst(side === 'start' ? candidates : [...candidates].reverse());
                    return;
                }
            }
        }

        // fallback to content
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
        // get all tabbable elements from both viewport and content
        let allCandidates: HTMLElement[] = [];

        // check viewport first
        if (isRootNavigationMenu(this.context) && this.context.viewport && this.context.viewport()) {
            const viewport = this.context.viewport();
            if (viewport) {
                allCandidates = getTabbableCandidates(viewport);
            }
        }

        // ... also check direct content
        if (this.contentRef()) {
            const contentCandidates = getTabbableCandidates(this.contentRef()!);
            allCandidates = [...allCandidates, ...contentCandidates];
        }

        // remove from tab order and store restore function
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
