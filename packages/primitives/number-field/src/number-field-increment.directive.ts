import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, ElementRef, inject, input, OnInit, signal } from '@angular/core';
import { injectNumberFieldRootContext } from './number-field-context.token';
import { PressedHoldService } from './utils';

@Directive({
    selector: 'button[rdxNumberFieldIncrement]',
    providers: [PressedHoldService],
    host: {
        tabindex: '-1',
        type: '"button"',
        '[attr.aria-label]': '"Increase"',
        '[attr.disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-pressed]': 'useHold.isPressed() ? "true" : undefined',

        '[style.user-select]': 'useHold.isPressed() ? "none" : null',

        '(contextmenu)': '$event.preventDefault()'
    }
})
export class RdxNumberFieldIncrementDirective implements OnInit {
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly pressedHold = inject(PressedHoldService);

    protected readonly rootContext = injectNumberFieldRootContext();

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * @ignore
     */
    readonly isDisabled = computed(
        () => this.rootContext.disabled() || this.disabled() || this.rootContext.isIncreaseDisabled()
    );

    /**
     * @ignore
     */
    readonly useHold = this.pressedHold.create({
        target: signal(this.elementRef.nativeElement),
        disabled: this.disabled
    });

    ngOnInit() {
        this.useHold.onTrigger(() => this.rootContext.handleIncrease());
    }
}
