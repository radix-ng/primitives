import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import { NumberInput } from '@radix-ng/primitives/core';

@Component({
    selector: 'rdx-arrow',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-content>
            <svg
                [style.width.px]="width()"
                [style.height.px]="height()"
                style="display: block"
                viewBox="0 0 30 10"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
            >
                <polygon points="0,0 30,0 15,10" fill="currentColor" />
            </svg>
        </ng-content>
    `
})
export class RdxArrow {
    readonly width = input<number, NumberInput>(10, { transform: numberAttribute });

    readonly height = input<number, NumberInput>(5, { transform: numberAttribute });
}
