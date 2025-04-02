import { booleanAttribute, Directive, HostListener, input } from '@angular/core';

const LINK_SELECT = 'navigationMenu.linkSelect';
const ROOT_CONTENT_DISMISS = 'navigationMenu.rootContentDismiss';

@Directive({
    selector: '[rdxNavigationMenuLink]',
    host: {
        '[attr.data-active]': 'active() ? "" : undefined',
        '[attr.aria-current]': 'active() ? "page" : undefined'
    }
})
export class RdxNavigationMenuLinkDirective {
    readonly active = input(false, { transform: booleanAttribute });
    readonly onSelect = input<(event: Event) => void>();

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        const target = event.target as HTMLElement;

        // dispatch link select event
        const linkSelectEvent = new CustomEvent(LINK_SELECT, {
            bubbles: true,
            cancelable: true
        });

        // add one-time listener for onSelect handler
        const onSelect = this.onSelect();
        if (onSelect) {
            target.addEventListener(LINK_SELECT, onSelect, { once: true });
        }

        // dispatch event
        target.dispatchEvent(linkSelectEvent);

        // if not prevented and not meta key, dismiss content
        if (!linkSelectEvent.defaultPrevented && !event.metaKey) {
            const dismissEvent = new CustomEvent(ROOT_CONTENT_DISMISS, {
                bubbles: true,
                cancelable: true
            });
            target.dispatchEvent(dismissEvent);
        }
    }
}
