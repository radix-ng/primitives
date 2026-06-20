import { Directive, input, numberAttribute } from '@angular/core';
import { NumberInput } from '@radix-ng/primitives/core';

/**
 * Maintains a fixed aspect ratio for its content using the native CSS `aspect-ratio` property.
 * Place the content inside (e.g. an `<img class="size-full object-cover">`) and it fills the box.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAspectRatio]',
    exportAs: 'rdxAspectRatio',
    host: {
        '[style.aspect-ratio]': 'ratio() || null',
        '[style.width]': '"100%"'
    }
})
export class RdxAspectRatioDirective {
    /**
     * The desired aspect ratio (e.g. `16 / 9`). Defaults to `1` (a square, 1:1).
     *
     * @group Props
     * @defaultValue 1
     */
    readonly ratio = input<number, NumberInput>(1, { transform: numberAttribute });
}
