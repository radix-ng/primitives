import { Directive, ElementRef, inject, Input, Signal, signal } from '@angular/core';
import { injectNavigationMenu } from './navigation-menu.token';
import { focusFirst, getTabbableCandidates, removeFromTabOrder } from './utils';

@Directive({
    selector: '[rdxNavigationMenuItem]',
    standalone: true,
    host: {
        '[attr.value]': 'value'
    },
    exportAs: 'rdxNavigationMenuItem'
})
export class RdxNavigationMenuItemDirective {
    private readonly context = injectNavigationMenu();
    readonly elementRef = inject(ElementRef);

    @Input() value = '';

    // References to child elements
    readonly triggerRef = signal<HTMLElement | null>(null);
    readonly contentRef = signal<HTMLElement | null>(null);
    readonly focusProxyRef = signal<HTMLElement | null>(null);
    readonly wasEscapeCloseRef = signal(false);

    private readonly _restoreContentTabOrderRef = signal<(() => void) | null>(null);

    // Public access to the signal value
    get restoreContentTabOrderRef(): Signal<(() => void) | null> {
        return this._restoreContentTabOrderRef;
    }

    onEntryKeyDown() {
        if (this.contentRef()) {
            // Restore tab order if needed
            const restoreFn = this._restoreContentTabOrderRef();
            if (restoreFn) restoreFn();

            // Find and focus first tabbable element
            const candidates = getTabbableCandidates(this.contentRef()!);
            if (candidates.length) {
                focusFirst(candidates);
            }
        }
    }

    onFocusProxyEnter(side: 'start' | 'end' = 'start') {
        if (this.contentRef()) {
            // Restore tab order if needed
            const restoreFn = this._restoreContentTabOrderRef();
            if (restoreFn) restoreFn();

            // Find and focus appropriate element based on direction
            const candidates = getTabbableCandidates(this.contentRef()!);
            if (candidates.length) {
                focusFirst(side === 'start' ? candidates : [...candidates].reverse());
            }
        }
    }

    onContentFocusOutside() {
        if (this.contentRef()) {
            // Remove elements from tab order when focus moves out
            const candidates = getTabbableCandidates(this.contentRef()!);
            if (candidates.length) {
                this._restoreContentTabOrderRef.set(removeFromTabOrder(candidates));
            }
        }
    }

    onRootContentClose() {
        this.onContentFocusOutside();
    }
}
