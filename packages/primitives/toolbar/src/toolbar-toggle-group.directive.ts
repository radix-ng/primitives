import { Directive } from '@angular/core';
import { RdxToggleGroupDirective } from '@radix-ng/primitives/toggle-group';

// TODO: set rovingFocus - false
@Directive({
    selector: '[rdxToolbarToggleGroup]',
    hostDirectives: [{ directive: RdxToggleGroupDirective, inputs: ['value', 'type', 'disabled'] }]
})
export class RdxToolbarToggleGroupDirective {}
