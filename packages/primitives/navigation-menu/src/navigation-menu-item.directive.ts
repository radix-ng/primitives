import { Directive, ElementRef, inject, input, Signal, signal } from '@angular/core';
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

    readonly value = input('');

    // references to child elements
    readonly triggerRef = signal<HTMLElement | null>(null);
    readonly contentRef = signal<HTMLElement | null>(null);
    readonly focusProxyRef = signal<HTMLElement | null>(null);
    readonly wasEscapeCloseRef = signal(false);

    private readonly _restoreContentTabOrderRef = signal<(() => void) | null>(null);

    get restoreContentTabOrderRef(): Signal<(() => void) | null> {
        return this._restoreContentTabOrderRef;
    }

    onEntryKeyDown() {
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

    onFocusProxyEnter(side: 'start' | 'end' = 'start') {
        if (this.contentRef()) {
            // restore tab order if needed
            const restoreFn = this._restoreContentTabOrderRef();
            if (restoreFn) restoreFn();

            // find and focus appropriate element based on direction
            const candidates = getTabbableCandidates(this.contentRef()!);
            if (candidates.length) {
                focusFirst(side === 'start' ? candidates : [...candidates].reverse());
            }
        }
    }

    onContentFocusOutside() {
        if (this.contentRef()) {
            // remove elements from tab order when focus moves out
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
