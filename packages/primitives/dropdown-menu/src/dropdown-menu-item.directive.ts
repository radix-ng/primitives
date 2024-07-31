import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { RdxMenuItemDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[rdxDropdownMenuItem]',
    standalone: true,
    hostDirectives: [{ directive: RdxMenuItemDirective, inputs: ['rdxDisabled: disabled '] }],
    host: {
        '(focus)': 'isFocused = true',
        '(blur)': 'isFocused = false',
        '[attr.data-highlighted]': 'isFocused ? "" : null',
        type: 'button',
    }
})
export class RdxDropdownMenuItemDirective {
    isFocused = false;

    /*
     * When true, prevents the user from interacting with the item.
     */
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
        alias: 'rdxDisabled'
    });
}
