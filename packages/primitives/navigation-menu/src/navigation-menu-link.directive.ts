import { booleanAttribute, Directive, ElementRef, inject, input, OnInit } from '@angular/core';
import { ENTER, SPACE } from '@radix-ng/primitives/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { RdxNavigationMenuFocusableOption } from './navigation-menu.types';
import { generateId } from './utils';

const LINK_SELECT = 'navigationMenu.linkSelect';
const ROOT_CONTENT_DISMISS = 'navigationMenu.rootContentDismiss';

@Directive({
    selector: '[rdxNavigationMenuLink]',
    hostDirectives: [{ directive: RdxRovingFocusItemDirective, inputs: ['focusable'] }],
    host: {
        '[attr.data-active]': 'active() ? "" : undefined',
        '[attr.aria-current]': 'active() ? "page" : undefined',
        '(click)': 'onClick($event)',
        '(keydown)': 'onKeydown($event)'
    },
    providers: [{ provide: RdxNavigationMenuFocusableOption, useExisting: RdxNavigationMenuLinkDirective }]
})
export class RdxNavigationMenuLinkDirective extends RdxNavigationMenuFocusableOption implements OnInit {
    private readonly rovingFocusItem = inject(RdxRovingFocusItemDirective, { self: true });
    private readonly uniqueId = generateId();
    readonly active = input(false, { transform: booleanAttribute });
    readonly onSelect = input<(event: Event) => void>();
    readonly elementRef = inject(ElementRef);

    ngOnInit(): void {
        this.rovingFocusItem.setTabStopId(this.elementRef.nativeElement.id || `link-${this.uniqueId}`);
    }

    override focus(): void {
        this.elementRef.nativeElement.focus();
    }

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

    onKeydown(event: KeyboardEvent): void {
        // activate link on Enter or Space
        if (event.key === ENTER || event.key === SPACE) {
            // prevent default behavior like scrolling (Space) or form submission (Enter) BEFORE simulating the click.
            event.preventDefault();

            // simulate a click event on the link element itself
            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            this.elementRef.nativeElement.dispatchEvent(clickEvent);

            return;
        }
    }
}
