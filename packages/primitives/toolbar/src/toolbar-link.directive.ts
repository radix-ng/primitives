import { Directive } from '@angular/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

@Directive({
    selector: '[rdxToolbarLink]',
    hostDirectives: [{ directive: RdxRovingFocusItemDirective, inputs: ['focusable'] }],
    host: {
        '(keydown)': 'onKeyDown($event)'
    }
})
export class RdxToolbarLinkDirective {
    onKeyDown($event: KeyboardEvent) {
        if ($event.key === ' ') ($event.currentTarget as HTMLElement)?.click();
    }
}
