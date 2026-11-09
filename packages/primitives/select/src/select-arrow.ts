import { computed, Directive, effect, inject } from '@angular/core';
import { RdxPopperArrow, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { RdxSelectItemAlignedPosition } from './select-item-aligned-position';
import { RDX_SELECT_POSITIONER_TOKEN } from './select-popup';
import { injectSelectRootContext } from './select-root';

/**
 * Decorative pointer from the popup to its trigger. Uses the shared Popper arrow geometry and
 * stays hidden while the selected item is aligned with the trigger.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxSelectArrow]',
    exportAs: 'rdxSelectArrow',
    hostDirectives: [{ directive: RdxPopperArrow, inputs: ['width', 'height'] }],
    host: {
        '[hidden]': '!arrow.positioningEnabled()',
        '[attr.data-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.open() ? undefined : ""',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()'
    }
})
export class RdxSelectArrow {
    protected readonly rootContext = injectSelectRootContext();
    private readonly positioner = inject(RDX_SELECT_POSITIONER_TOKEN);
    protected readonly wrapper = this.positioner instanceof RdxPopperContentWrapper ? this.positioner : null;
    protected readonly arrow = inject(RdxPopperArrow);

    protected readonly side = computed(() =>
        !this.arrow.positioningEnabled() ? 'none' : this.wrapper ? this.wrapper.placedSide() : 'bottom'
    );
    protected readonly align = computed(() => (this.wrapper ? this.wrapper.placedAlign() : 'start'));

    constructor() {
        if (this.positioner instanceof RdxSelectItemAlignedPosition) {
            const positioner = this.positioner;
            this.arrow.positioningEnabled.set(false);
            effect(() => {
                // Preserve the final geometry through exit; open=false alone must not reveal an
                // item-aligned arrow while presence is waiting for the popup's closing animation.
                if (this.rootContext.open()) {
                    this.arrow.positioningEnabled.set(!positioner.alignItemWithTriggerActive());
                }
            });
        }
    }
}
