import { booleanAttribute, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import { injectTabsRootContext } from './tabs-root-context';

/**
 * Groups the individual tab buttons and manages keyboard navigation.
 *
 * @see https://base-ui.com/react/components/tabs
 */
@Directive({
    selector: '[rdxTabsList]',
    exportAs: 'rdxTabsList',
    hostDirectives: [RdxRovingFocusGroupDirective],
    host: {
        role: 'tablist',
        '[attr.aria-orientation]': 'rootContext.orientation()',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-activation-direction]': 'rootContext.activationDirection()'
    }
})
export class RdxTabsList {
    protected readonly rootContext = injectTabsRootContext();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly rovingFocusGroup = inject(RdxRovingFocusGroupDirective, { self: true });

    /**
     * Whether a tab is activated when it receives focus (automatic activation).
     * When `false`, tabs are only activated on click or Enter/Space.
     *
     * @default false
     */
    readonly activateOnFocus = input(false, { transform: booleanAttribute });

    /**
     * Whether keyboard navigation should loop from the last tab back to the first.
     *
     * @default true
     */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    constructor() {
        this.rootContext.setTabListElement(this.elementRef.nativeElement);

        effect(() => {
            this.rovingFocusGroup.setOrientation(this.rootContext.orientation());
            this.rovingFocusGroup.setLoop(this.loopFocus());
        });

        effect(() => this.rootContext.setActivateOnFocus(this.activateOnFocus()));
    }
}
