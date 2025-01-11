import { Directive } from '@angular/core';
import { RdxToggleGroupWithoutFocusDirective } from '@radix-ng/primitives/toggle-group';

// TODO: set rovingFocus - false
@Directive({
    selector: '[rdxToolbarToggleGroup]',
    hostDirectives: [{ directive: RdxToggleGroupWithoutFocusDirective, inputs: ['value', 'type', 'disabled'] }]
})
export class RdxToolbarToggleGroupDirective {}
