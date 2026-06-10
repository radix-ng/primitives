import { computed, Directive, input, signal } from '@angular/core';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';
import { generateId } from './utils';

/**
 * A single navigation menu item. Holds a trigger + content pair, or a standalone link.
 */
@Directive({
    selector: '[rdxNavigationMenuItem]',
    exportAs: 'rdxNavigationMenuItem'
})
export class RdxNavigationMenuItem {
    private readonly rootContext = injectNavigationMenuRootContext();

    /**
     * A unique value that identifies the item. Falls back to a generated id.
     */
    readonly value = input<string, string | undefined>('', {
        transform: (value) => value || `item-${generateId()}`
    });

    /** The trigger element, set by the trigger directive. */
    readonly triggerRef = signal<HTMLElement | null>(null);

    /** Whether this item is the currently open one. */
    readonly isOpen = computed(() => this.rootContext.value() === this.value());

    readonly triggerId = computed(() => this.rootContext.triggerId(this.value()));
    readonly contentId = computed(() => this.rootContext.contentId(this.value()));
}
