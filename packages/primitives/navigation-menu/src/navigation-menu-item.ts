import { injectNavigationMenuRootContext } from './navigation-menu-root-context';
import { computed, Directive, input, signal } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';

/**
 * A single navigation menu item. Holds a trigger + content pair, or a standalone link.
 */
@Directive({
    selector: '[rdxNavigationMenuItem]',
    exportAs: 'rdxNavigationMenuItem'
})
export class RdxNavigationMenuItem {
    private readonly rootContext = injectNavigationMenuRootContext();

    /** A unique value that identifies the item. Falls back to a stable generated id. */
    readonly valueInput = input<string | undefined>(undefined, { alias: 'value' });
    private readonly generatedValue = injectId('rdx-nav-menu-item-');
    readonly value = computed(() => this.valueInput() || this.generatedValue);

    /** The trigger element, set by the trigger directive. */
    readonly triggerRef = signal<HTMLElement | null>(null);

    /** Whether this item is the currently open one. */
    readonly isOpen = computed(() => this.rootContext.value() === this.value());

    readonly triggerId = computed(() => this.rootContext.triggerId(this.value()));
    readonly contentId = computed(() => this.rootContext.contentId(this.value()));
}
