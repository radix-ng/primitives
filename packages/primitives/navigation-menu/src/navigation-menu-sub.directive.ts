import { Directive, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import {
    NavigationMenuDirection,
    NavigationMenuOrientation,
    RdxNavigationMenuDirective
} from './navigation-menu.directive';
import { provideNavigationMenu } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuSub]',
    standalone: true,
    providers: [provideNavigationMenu(RdxNavigationMenuSubDirective)],
    host: {
        '[attr.data-orientation]': 'orientation'
    }
})
export class RdxNavigationMenuSubDirective {
    private readonly parent = inject(RdxNavigationMenuDirective, { optional: true });

    /** The current active value (selected menu item) */
    readonly value = signal<string>('');

    /** The orientation of this submenu */
    @Input() orientation: NavigationMenuOrientation = 'horizontal';

    /** Default value for the submenu */
    @Input() set defaultValue(value: string) {
        if (value) {
            this.value.set(value);
        }
    }

    /** Whether this is a root menu (always false for submenu) */
    readonly isRootMenu = false;

    /** Get the reading direction from the parent */
    get dir(): NavigationMenuDirection {
        return this.parent?.dir || 'ltr';
    }

    /** Get the root navigation menu from the parent */
    get rootNavigationMenu(): HTMLElement | null {
        return this.parent?.rootNavigationMenu() || null;
    }

    /** Event emitted when the value changes */
    @Output() valueChange = new EventEmitter<string>();

    /**
     * Handler for when a trigger is entered
     */
    onTriggerEnter(itemValue: string): void {
        this.setValue(itemValue);
    }

    /**
     * Handler for when an item is selected
     */
    onItemSelect(itemValue: string): void {
        this.setValue(itemValue);
    }

    /**
     * Handler for when an item is dismissed
     */
    onItemDismiss(): void {
        this.setValue('');
    }

    /**
     * Updates the value
     */
    private setValue(value: string): void {
        this.value.set(value);
        this.valueChange.emit(value);
    }
}
