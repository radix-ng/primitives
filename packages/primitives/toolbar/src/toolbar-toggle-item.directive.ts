import { Directive } from '@angular/core';
import { RdxToggleGroupItemDirective } from '@radix-ng/primitives/toggle-group';

@Directive({
    selector: '[rdxToolbarToggleItem]',
    hostDirectives: [{ directive: RdxToggleGroupItemDirective, inputs: ['value', 'disabled'] }]
})
export class RdxToolbarToggleItemDirective {}
