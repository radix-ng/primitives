import { Directive, EventEmitter, Input, numberAttribute, OnDestroy, Output, signal } from '@angular/core';
import { provideNavigationMenu } from './navigation-menu.token';

export type NavigationMenuOrientation = 'horizontal' | 'vertical';
export type NavigationMenuDirection = 'ltr' | 'rtl';

@Directive({
    selector: '[rdxNavigationMenu]',
    standalone: true,
    providers: [provideNavigationMenu(RdxNavigationMenuDirective)],
    host: {
        '[attr.data-orientation]': 'orientation',
        '[attr.dir]': 'dir',
        role: 'navigation',
        '[attr.aria-label]': '"Main"'
    }
})
export class RdxNavigationMenuDirective implements OnDestroy {
    /** The current active value (selected menu item) */
    readonly value = signal<string>('');

    /** The previous active value */
    readonly previousValue = signal<string>('');

    /** Reference to the root navigation menu element */
    readonly rootNavigationMenu = signal<HTMLElement | null>(null);

    /** Whether this is the root menu (vs a submenu) */
    readonly isRootMenu = true;

    /** The navigation menu's orientation */
    @Input() orientation: NavigationMenuOrientation = 'horizontal';

    /** The reading direction of the navigation menu */
    @Input() dir: NavigationMenuDirection = 'ltr';

    /** The delay duration before opening a menu item */
    @Input({ transform: numberAttribute }) delayDuration: number = 200;

    /** How much time a user has to enter another trigger without incurring a delay again */
    @Input({ transform: numberAttribute }) skipDelayDuration: number = 300;

    /** Event emitted when the active value changes */
    @Output() valueChange = new EventEmitter<string>();

    /** Internal signals for tracking viewport and indicator elements */
    readonly viewport = signal<HTMLElement | null>(null);
    readonly indicatorTrack = signal<HTMLElement | null>(null);
    readonly viewportContent = signal<Map<string, any>>(new Map());
    readonly isOpenDelayed = signal<boolean>(true);

    private openTimerRef = 0;
    private closeTimerRef = 0;
    private skipDelayTimerRef = 0;

    ngOnDestroy() {
        // Clean up any timers
        window.clearTimeout(this.openTimerRef);
        window.clearTimeout(this.closeTimerRef);
        window.clearTimeout(this.skipDelayTimerRef);
    }

    /**
     * Updates the active value
     */
    setValue(value: string): void {
        this.previousValue.set(this.value());
        this.value.set(value);
        this.valueChange.emit(value);
    }

    /**
     * Handler for when a trigger is entered
     */
    onTriggerEnter(itemValue: string): void {
        window.clearTimeout(this.openTimerRef);
        if (this.isOpenDelayed()) {
            this.handleDelayedOpen(itemValue);
        } else {
            this.handleOpen(itemValue);
        }
    }

    /**
     * Handler for when a trigger is left
     */
    onTriggerLeave(): void {
        window.clearTimeout(this.openTimerRef);
        this.startCloseTimer();
    }

    /**
     * Handler for when content is entered
     */
    onContentEnter(): void {
        window.clearTimeout(this.closeTimerRef);
    }

    /**
     * Handler for when content is left
     */
    onContentLeave(): void {
        this.startCloseTimer();
    }

    /**
     * Handler for when an item is selected
     */
    onItemSelect(itemValue: string): void {
        this.setValue(itemValue === this.value() ? '' : itemValue);
    }

    /**
     * Handler for when an item is dismissed
     */
    onItemDismiss(): void {
        this.setValue('');
    }

    /**
     * Starts the close timer
     */
    private startCloseTimer(): void {
        window.clearTimeout(this.closeTimerRef);
        this.closeTimerRef = window.setTimeout(() => this.setValue(''), 150);
    }

    /**
     * Opens a menu item immediately
     */
    private handleOpen(itemValue: string): void {
        window.clearTimeout(this.closeTimerRef);
        this.setValue(itemValue);
    }

    /**
     * Opens a menu item after a delay
     */
    private handleDelayedOpen(itemValue: string): void {
        const isOpenItem = this.value() === itemValue;
        if (isOpenItem) {
            // If item is already open, clear close timer
            window.clearTimeout(this.closeTimerRef);
        } else {
            this.openTimerRef = window.setTimeout(() => {
                window.clearTimeout(this.closeTimerRef);
                this.setValue(itemValue);
            }, this.delayDuration);
        }
    }

    /**
     * Updates viewport content
     */
    onViewportContentChange(contentValue: string, contentData: any): void {
        const currentContent = new Map(this.viewportContent());
        currentContent.set(contentValue, contentData);
        this.viewportContent.set(currentContent);
    }

    /**
     * Removes viewport content
     */
    onViewportContentRemove(contentValue: string): void {
        const currentContent = new Map(this.viewportContent());
        if (!currentContent.has(contentValue)) return;

        currentContent.delete(contentValue);
        this.viewportContent.set(currentContent);
    }
}
