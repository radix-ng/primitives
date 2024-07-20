import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';

import { RdxMenuItemDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[DropdownMenuItem]',
    standalone: true,
    hostDirectives: [{ directive: RdxMenuItemDirective, inputs: ['rdxDisabled: disabled '] }]
})
export class RdxDropdownMenuItemDirective {
    /*
     * When true, prevents the user from interacting with the item.
     */
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
        alias: 'rdxDisabled'
    });
}
