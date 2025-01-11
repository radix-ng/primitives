import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, effect, inject, input, signal } from '@angular/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

@Directive({
    selector: '[rdxToolbarButton]',
    hostDirectives: [{ directive: RdxRovingFocusItemDirective, inputs: ['focusable'] }]
})
export class RdxToolbarButtonDirective {
    private readonly rdxRovingFocusItemDirective = inject(RdxRovingFocusItemDirective);

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    private readonly isDisabled = signal(this.disabled());

    #disableChanges = effect(() => {
        this.rdxRovingFocusItemDirective.focusable = !this.isDisabled();
    });
}
