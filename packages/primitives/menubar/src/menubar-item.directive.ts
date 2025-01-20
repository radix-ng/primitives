import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { RdxMenuItemDirective } from '@radix-ng/primitives/menu';

@Directive({
    selector: '[MenuBarItem]',
    hostDirectives: [
        {
            directive: RdxMenuItemDirective,
            inputs: ['rdxDisabled: disabled ']
        }
    ]
})
export class RdxMenuBarItemDirective {
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
}
