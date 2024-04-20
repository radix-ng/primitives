import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import {
    booleanAttribute,
    DestroyRef,
    Directive,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    QueryList,
    SimpleChanges
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { RovingFocusGroupToken } from './roving-focus-group.token';
import type { RovingFocusItemDirective } from './roving-focus-item.directive';

@Directive({
    selector: '[rdxRovingFocusGroup]',
    standalone: true,
    providers: [{ provide: RovingFocusGroupToken, useExisting: RovingFocusGroupDirective }]
})
export class RovingFocusGroupDirective implements OnInit, OnChanges, OnDestroy {
    private readonly directionality = inject(Directionality);

    private readonly destroyRef = inject(DestroyRef);

    /**
     * Create a query list of all the roving focus items.
     * We don't use ContentChildren as dynamically added items may not be in the correct order.
     */
    private readonly items = new QueryList<RovingFocusItemDirective>();

    /**
     * Create the focus key manager instance.
     * @internal
     */
    readonly keyManager = new FocusKeyManager<RovingFocusItemDirective>(this.items);

    /**
     * Determine the orientation of the roving focus group.
     * @default vertical
     */
    @Input() orientation: 'horizontal' | 'vertical' = 'vertical';

    /**
     * Determine if focus should wrap when the end or beginning is reached.
     * @default true
     */
    @Input({ transform: booleanAttribute }) wrap = true;

    ngOnInit(): void {
        this.keyManager.withWrap(this.wrap);

        this.setOrientation(this.orientation);

        // update the key manager orientation if the document direction changes
        this.directionality.change
            .pipe(
                filter(() => this.orientation === 'horizontal'),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((direction) => this.keyManager.withHorizontalOrientation(direction));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('orientation' in changes) {
            this.setOrientation(this.orientation);
        }

        if ('wrap' in changes) {
            this.keyManager.withWrap(this.wrap);
        }
    }

    ngOnDestroy(): void {
        this.keyManager.destroy();
    }

    /**
     * Register a roving focus item.
     * @param item The roving focus item to register.
     */
    register(item: RovingFocusItemDirective): void {
        // add the item to the query list by sort the items based on their order
        this.items.reset([...this.items.toArray(), item].sort((a, b) => a.order - b.order));

        // if this is the first item, make it the active item
        if (this.items.length === 1) {
            this.keyManager.updateActiveItem(item);
        }
    }

    /**
     * Unregister a roving focus item.
     * @param item The roving focus item to unregister.
     */
    unregister(item: RovingFocusItemDirective): void {
        // determine if the item being removed is the active item
        const isActive = this.keyManager.activeItem === item;

        // remove the item from the query list
        this.items.reset(this.items.toArray().filter((i) => i !== item));

        // if the item being removed is the active item, make the first item the active item
        if (isActive) {
            this.keyManager.updateActiveItem(0);
        }
    }

    /**
     * Handle key events on the roving focus items.
     * @param event The key event.
     * @internal
     */
    onKeydown(event: KeyboardEvent): void {
        this.keyManager.onKeydown(event);
    }

    /**
     * Set the orientation of the roving focus group.
     * @param orientation The orientation of the roving focus group.
     */
    setOrientation(orientation: 'horizontal' | 'vertical'): void {
        this.orientation = orientation;

        if (orientation === 'horizontal') {
            this.keyManager.withHorizontalOrientation(this.directionality.value);
        } else {
            this.keyManager.withVerticalOrientation();
        }
    }
}
