import { AfterViewInit, booleanAttribute, Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { injectNavigationMenu } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuTrigger]',
    standalone: true,
    host: {
        role: 'button',
        type: 'button',
        '[attr.aria-expanded]': 'open',
        '[attr.aria-controls]': 'contentId',
        '[attr.data-state]': 'getOpenState()',
        '[attr.data-disabled]': 'disabled ? "" : undefined',
        '[disabled]': 'disabled ? "" : undefined'
    }
})
export class RdxNavigationMenuTriggerDirective implements AfterViewInit {
    protected readonly context = injectNavigationMenu();
    protected readonly item = inject(RdxNavigationMenuItemDirective);
    protected readonly elementRef = inject(ElementRef);

    /** Whether the trigger is disabled */
    @Input({ transform: booleanAttribute }) disabled = false;

    /** A unique ID for the trigger */
    private readonly triggerId = `rdx-nav-menu-trigger-${this.item.value || Math.random().toString(36).slice(2)}`;

    /** The content ID for aria-controls */
    protected readonly contentId = `rdx-nav-menu-content-${this.item.value || Math.random().toString(36).slice(2)}`;

    /** Whether the associated content is open */
    get open(): boolean {
        if ('value' in this.context) {
            return this.item.value === this.context.value();
        }
        return false;
    }

    ngAfterViewInit() {
        // Register the trigger element with the item
        this.item.triggerRef.set(this.elementRef.nativeElement);
    }

    @HostListener('pointerenter')
    onPointerEnter(): void {
        if (this.disabled) return;

        this.item.wasEscapeCloseRef.set(false);
        if ('onTriggerEnter' in this.context) {
            this.context.onTriggerEnter(this.item.value);
        }
    }

    @HostListener('pointerleave')
    onPointerLeave(): void {
        if (this.disabled) return;

        if ('onTriggerLeave' in this.context) {
            this.context.onTriggerLeave();
        }
    }

    @HostListener('click')
    onClick(): void {
        if (this.disabled) return;

        if ('onItemSelect' in this.context) {
            this.context.onItemSelect(this.item.value);
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (this.disabled) return;

        const verticalEntryKey = this.context.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
        const entryKey = {
            horizontal: 'ArrowDown',
            vertical: verticalEntryKey
        }[this.context.orientation];

        if (this.open && event.key === entryKey) {
            this.item.onEntryKeyDown();
            event.preventDefault();
        }
    }

    /**
     * Get the open state for the data-state attribute
     */
    getOpenState(): string {
        return this.open ? 'open' : 'closed';
    }
}
