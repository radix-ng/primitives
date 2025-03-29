import { booleanAttribute, Directive, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[rdxNavigationMenuLink]',
    standalone: true,
    host: {
        role: 'link',
        '[attr.data-active]': 'active ? "" : undefined',
        '[attr.aria-current]': 'active ? "page" : undefined'
    }
})
export class RdxNavigationMenuLinkDirective {
    @Input({ transform: booleanAttribute }) active = false;

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;

        // Dispatch a link select event
        const linkSelectEvent = new CustomEvent('navigationMenu.linkSelect', {
            bubbles: true,
            cancelable: true
        });

        // Add one-time listener for the onSelect handler
        target.addEventListener(
            'navigationMenu.linkSelect',
            () => {
                // Handle onSelect callback if needed
            },
            { once: true }
        );

        target.dispatchEvent(linkSelectEvent);

        // If the event isn't prevented and it's not a meta-click, dismiss the menu
        if (!linkSelectEvent.defaultPrevented && !event.metaKey) {
            const rootContentDismissEvent = new CustomEvent('navigationMenu.rootContentDismiss', {
                bubbles: true,
                cancelable: true
            });
            target.dispatchEvent(rootContentDismissEvent);
        }
    }
}
