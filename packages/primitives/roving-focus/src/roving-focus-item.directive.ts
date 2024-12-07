import { booleanAttribute, computed, Directive, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { RdxRovingFocusGroupDirective } from './roving-focus-group.directive';
import { focusFirst, generateId, getFocusIntent, wrapArray } from './utils';

@Directive({
    selector: '[rdxRovingFocusItem]',
    standalone: true,
    host: {
        '[attr.tabindex]': 'tabIndex',

        '(mousedown)': 'handleMouseDown($event)',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'onFocus()'
    }
})
export class RdxRovingFocusItemDirective implements OnInit, OnDestroy {
    private readonly elementRef = inject(ElementRef);
    private readonly parent = inject(RdxRovingFocusGroupDirective);

    @Input({ transform: booleanAttribute }) focusable: boolean = true;
    @Input({ transform: booleanAttribute }) active: boolean = true;
    @Input() tabStopId: string | undefined;
    @Input({ transform: booleanAttribute }) allowShiftKey: boolean = false;

    private readonly id = computed(() => this.tabStopId || generateId());

    /** @ignore */
    readonly isCurrentTabStop = computed(() => this.parent.currentTabStopId() === this.id());

    /** @ignore */
    ngOnInit() {
        if (this.focusable) {
            this.parent.registerItem(this.elementRef.nativeElement);
            this.parent.onFocusableItemAdd();
        }
    }

    /** @ignore */
    ngOnDestroy() {
        if (this.focusable) {
            this.parent.unregisterItem(this.elementRef.nativeElement);
            this.parent.onFocusableItemRemove();
        }
    }

    /** @ignore */
    get tabIndex() {
        return this.isCurrentTabStop() ? 0 : -1;
    }

    /** @ignore */
    handleMouseDown(event: MouseEvent) {
        if (!this.focusable) {
            // We prevent focusing non-focusable items on `mousedown`.
            // Even though the item has tabIndex={-1}, that only means take it out of the tab order.
            event.preventDefault();
        } else {
            // Safari doesn't focus a button when clicked so we run our logic on mousedown also
            this.parent.onItemFocus(this.id());
        }
    }

    /** @ignore */
    onFocus() {
        if (this.focusable) {
            this.parent.onItemFocus(this.id());
        }
    }

    /** @ignore */
    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Tab' && event.shiftKey) {
            this.parent.onItemShiftTab();
            return;
        }

        if (event.target !== this.elementRef.nativeElement) return;

        const focusIntent = getFocusIntent(event, this.parent.orientation, this.parent.dir);
        if (focusIntent !== undefined) {
            if (event.metaKey || event.ctrlKey || event.altKey || (this.allowShiftKey ? false : event.shiftKey)) {
                return;
            }

            event.preventDefault();

            let candidateNodes = this.parent.focusableItems().filter((item) => item.dataset['disabled'] !== '');

            if (focusIntent === 'last') {
                candidateNodes.reverse();
            } else if (focusIntent === 'prev' || focusIntent === 'next') {
                if (focusIntent === 'prev') candidateNodes.reverse();
                const currentIndex = candidateNodes.indexOf(this.elementRef.nativeElement);

                candidateNodes = this.parent.loop
                    ? wrapArray(candidateNodes, currentIndex + 1)
                    : candidateNodes.slice(currentIndex + 1);
            }

            focusFirst(candidateNodes, false);
        }
    }
}
