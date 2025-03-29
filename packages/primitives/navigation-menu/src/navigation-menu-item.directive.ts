import { Directive, ElementRef, inject, Input, signal } from '@angular/core';
import { injectNavigationMenu } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuItem]',
    standalone: true,
    host: {}
})
export class RdxNavigationMenuItemDirective {
    protected readonly context = injectNavigationMenu();
    protected readonly elementRef = inject(ElementRef);

    /** The unique value for this menu item */
    @Input() value: string = '';

    readonly triggerRef = signal<HTMLElement | null>(null);
    readonly contentRef = signal<HTMLElement | null>(null);
    readonly focusProxyRef = signal<HTMLElement | null>(null);
    readonly wasEscapeCloseRef = signal<boolean>(false);

    onEntryKeyDown(): void {
        if (this.contentRef()) {
            // Focus the first tabbable element in the content
            setTimeout(() => {
                const content = this.contentRef();
                if (content) {
                    const focusableElements = this.getTabbableCandidates(content);
                    if (focusableElements.length > 0) {
                        focusableElements[0].focus();
                    }
                }
            });
        }
    }

    onFocusProxyEnter(side: 'start' | 'end'): void {
        if (this.contentRef()) {
            // Focus the first/last tabbable element depending on 'side'
            setTimeout(() => {
                const content = this.contentRef();
                if (content) {
                    const focusableElements = this.getTabbableCandidates(content);
                    if (focusableElements.length > 0) {
                        const elementToFocus =
                            side === 'start' ? focusableElements[0] : focusableElements[focusableElements.length - 1];
                        elementToFocus.focus();
                    }
                }
            });
        }
    }

    onContentFocusOutside(): void {
        if (this.contentRef()) {
            // Remove tabbable elements from tab order
            const content = this.contentRef();
            if (content) {
                const tabbables = this.getTabbableCandidates(content);
                tabbables.forEach((el) => {
                    el.setAttribute('tabindex', '-1');
                });
            }
        }
    }

    onRootContentClose(): void {
        this.onContentFocusOutside();
    }

    /**
     * Get all tabbable elements within a container
     */
    private getTabbableCandidates(container: HTMLElement): HTMLElement[] {
        const candidates: HTMLElement[] = [];
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
            acceptNode: (node: any) => {
                const isHiddenInput = node.tagName === 'INPUT' && node.type === 'hidden';
                if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
                return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
        });

        while (walker.nextNode()) {
            candidates.push(walker.currentNode as HTMLElement);
        }

        return candidates;
    }
}
