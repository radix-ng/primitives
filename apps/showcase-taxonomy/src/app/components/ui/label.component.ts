import { cva } from 'class-variance-authority';
import { Directive } from '@angular/core';
import { LabelDirective as RadixLabel } from '@radix-ng/primitives/label';

const labelVariants = cva(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

@Directive({
    selector: '[txLabel]',
    standalone: true,
    hostDirectives: [
        {
            directive: RadixLabel,
            inputs: ['htmlFor']
        }
    ],
    host: {
        '[class]': '_computedClass()'
    }
})
export class LabelDirective {
    protected readonly _computedClass = labelVariants;
}
