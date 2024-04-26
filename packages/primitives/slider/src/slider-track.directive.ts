import { booleanAttribute, Directive, Input } from '@angular/core';

@Directive({
    standalone: true,
    host: {
        '[attr.data-disabled]': 'disabled'
    }
})
export class SliderTrackDirective {
    @Input({ transform: booleanAttribute }) disabled = false;
}
