import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RdxVisuallyHiddenDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    selector: 'rdx-navigation-menu-focus-proxy',
    template: `
        <span
            [attr.tabindex]="0"
            [attr.aria-hidden]="true"
            (focus)="onFocus($event)"
            rdxVisuallyHidden
            feature="focusable"
        ></span>
    `,
    imports: [RdxVisuallyHiddenDirective]
})
export class RdxNavigationMenuFocusProxyComponent {
    @Input() triggerElement: HTMLElement | null = null;
    @Input() contentElement: HTMLElement | null = null;
    @Output() proxyFocus = new EventEmitter<'start' | 'end'>();

    onFocus(event: FocusEvent): void {
        const prevFocusedElement = event.relatedTarget as HTMLElement | null;
        const wasTriggerFocused = prevFocusedElement === this.triggerElement;
        const wasFocusFromContent = this.contentElement ? this.contentElement.contains(prevFocusedElement) : false;

        if (wasTriggerFocused || !wasFocusFromContent) {
            this.proxyFocus.emit(wasTriggerFocused ? 'start' : 'end');
        }
    }
}

@Component({
    selector: 'rdx-navigation-menu-aria-owns',
    template: `
        <span [attr.aria-owns]="contentId" rdxVisuallyHidden feature="fully-hidden"></span>
    `,
    imports: [RdxVisuallyHiddenDirective]
})
export class RdxNavigationMenuAriaOwnsComponent {
    @Input() contentId: string = '';
}
