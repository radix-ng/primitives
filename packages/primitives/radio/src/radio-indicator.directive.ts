import { booleanAttribute, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectRadioIndicatorPresence, useRadioIndicatorTransition } from './radio-indicator-presence.directive';
import { injectRadioItemContext } from './radio-item.directive';

@Directive({
    selector: '[rdxRadioIndicator]',
    exportAs: 'rdxRadioIndicator',
    host: {
        '[attr.data-checked]': 'itemContext.checkedState() ? "" : undefined',
        '[attr.data-unchecked]': '!itemContext.checkedState() ? "" : undefined',
        '[attr.data-disabled]': 'itemContext.disabledState() ? "" : undefined',
        '[attr.data-readonly]': 'itemContext.readonlyState() ? "" : undefined',
        '[attr.data-required]': 'itemContext.requiredState() ? "" : undefined',
        '[attr.data-valid]': 'itemContext.field?.validState() === true ? "" : undefined',
        '[attr.data-invalid]': 'itemContext.field?.validState() === false ? "" : undefined',
        '[attr.data-touched]': 'itemContext.field?.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'itemContext.field?.dirtyState() ? "" : undefined',
        '[attr.data-filled]': 'itemContext.field?.filledState() ? "" : undefined',
        '[attr.data-focused]': 'itemContext.field?.focusedState() ? "" : undefined',
        '[attr.data-starting-style]': 'transition.status() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'transition.status() === "ending" ? "" : undefined',
        '[style.display]': 'hidden() ? "none" : null',
        '[style.pointer-events]': '"none"'
    }
})
export class RdxRadioIndicatorDirective {
    protected readonly itemContext = injectRadioItemContext();
    private readonly presence = (() => {
        const presence = injectRadioIndicatorPresence(true);
        return presence?.item === this.itemContext ? presence : null;
    })();
    protected readonly transition =
        this.presence?.transition ?? useRadioIndicatorTransition(this.itemContext.checkedState);

    /** Leave an attribute-only host displayed when unchecked. Structural ownership has its own option. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    constructor() {
        const unregister = this.transition.registerElement(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
        inject(DestroyRef).onDestroy(unregister);
    }

    protected hidden(): boolean {
        return (
            !this.presence &&
            !this.keepMounted() &&
            !this.itemContext.checkedState() &&
            this.transition.status() !== 'ending'
        );
    }
}
