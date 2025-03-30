import { booleanAttribute, Directive, ElementRef, HostListener, inject, Input } from '@angular/core';

const LINK_SELECT = 'navigationMenu.linkSelect';
const ROOT_CONTENT_DISMISS = 'navigationMenu.rootContentDismiss';

@Directive({
    selector: '[rdxNavigationMenuLink]',
    standalone: true,
    host: {
        '[attr.data-active]': 'active ? "" : undefined',
        '[attr.aria-current]': 'active ? "page" : undefined'
    }
})
export class RdxNavigationMenuLinkDirective {
    private readonly elementRef = inject(ElementRef);

    @Input({ transform: booleanAttribute }) active = false;
    @Input() onSelect: ((event: Event) => void) | undefined;

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        const target = event.target as HTMLElement;

        // Dispatch link select event
        const linkSelectEvent = new CustomEvent(LINK_SELECT, {
            bubbles: true,
            cancelable: true
        });

        // Add one-time listener for onSelect handler
        if (this.onSelect) {
            target.addEventListener(LINK_SELECT, this.onSelect, { once: true });
        }

        // Dispatch event
        target.dispatchEvent(linkSelectEvent);

        // If not prevented and not meta key, dismiss content
        if (!linkSelectEvent.defaultPrevented && !event.metaKey) {
            const dismissEvent = new CustomEvent(ROOT_CONTENT_DISMISS, {
                bubbles: true,
                cancelable: true
            });
            target.dispatchEvent(dismissEvent);
        }
    }
}
