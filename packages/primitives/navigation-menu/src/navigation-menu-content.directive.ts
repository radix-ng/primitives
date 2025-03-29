import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, HostListener, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { injectNavigationMenu, isNavigationMenuRoot } from './navigation-menu.token';

export const ROOT_CONTENT_DISMISS = 'navigationMenu.rootContentDismiss';

@Directive({
    selector: '[rdxNavigationMenuContent]',
    standalone: true,
    host: {
        '[id]': 'contentId',
        '[attr.data-state]': 'getOpenState()',
        '[attr.data-motion]': 'getMotionAttribute()',
        '[attr.data-orientation]': 'context.orientation',
        '[attr.aria-labelledby]': 'triggerId'
    }
})
export class RdxNavigationMenuContentDirective implements OnInit, OnDestroy {
    protected readonly context = injectNavigationMenu();
    protected readonly item = inject(RdxNavigationMenuItemDirective);
    protected readonly elementRef = inject(ElementRef);

    /** Whether the content is in a viewport */
    @Input({ transform: coerceBooleanProperty }) forceMount: BooleanInput;

    /** A unique ID for the content */
    readonly contentId = `rdx-nav-menu-content-${this.item.value || Math.random().toString(36).slice(2)}`;

    /** The ID of the trigger */
    readonly triggerId = `rdx-nav-menu-trigger-${this.item.value || Math.random().toString(36).slice(2)}`;

    /** Whether the associated item is open */
    get open(): boolean {
        if ('value' in this.context) {
            return this.item.value === this.context.value();
        }
        return false;
    }

    private motionAttribute: string | null = null;

    ngOnInit() {
        // Store this content element in the item's content reference
        this.item.contentRef.set(this.elementRef.nativeElement);

        // Register with the root menu for viewport rendering
        if (isNavigationMenuRoot(this.context)) {
            this.context.onViewportContentChange(this.item.value, {
                ref: this.elementRef,
                forceMount: this.forceMount,
                value: this.item.value
            });
        }

        this.updateMotionAttribute();
    }

    ngOnDestroy() {
        // Unregister from the viewport when destroyed
        if (isNavigationMenuRoot(this.context)) {
            this.context.onViewportContentRemove(this.item.value);
        }
    }

    @HostListener('pointerenter')
    onPointerEnter(): void {
        if ('onContentEnter' in this.context) {
            this.context.onContentEnter();
        }
    }

    @HostListener('pointerleave')
    onPointerLeave(): void {
        if ('onContentLeave' in this.context) {
            this.context.onContentLeave();
        }
    }

    // Rest of your existing methods...

    /**
     * Get the open state for the data-state attribute
     */
    getOpenState(): string {
        return this.open ? 'open' : 'closed';
    }

    /**
     * Get the motion attribute for animation direction
     */
    getMotionAttribute(): string | null {
        this.updateMotionAttribute();
        return this.motionAttribute;
    }

    /**
     * Update the motion attribute based on the movement direction
     */
    private updateMotionAttribute(): void {
        // Your existing implementation...
    }
}
