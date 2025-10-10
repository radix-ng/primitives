import { NumberInput } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';

@Component({
    selector: 'rdx-arrow',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-content>
            <svg [style.width.px]="width()" [style.height.px]="height()" viewBox="0 0 30 10" preserveAspectRatio="none">
                <polygon points="0,0 30,0 15,10" />
            </svg>
        </ng-content>
    `
})
export class RdxArrow {
    readonly width = input<number, NumberInput>(10, { transform: numberAttribute });

    readonly height = input<number, NumberInput>(5, { transform: numberAttribute });
}
