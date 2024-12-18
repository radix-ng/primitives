import { booleanAttribute, Component, computed, input, numberAttribute } from '@angular/core';

import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { radii, RadixColor } from '@radix-ng/components/types';
import { RdxSwitchInputDirective, RdxSwitchRootDirective, RdxSwitchThumbDirective } from '@radix-ng/primitives/switch';
import classNames from 'classnames';

export type SwitchVariant = 'classic' | 'surface' | 'soft';

@Component({
    selector: 'rdx-theme-switch, [rdxThemeSwitch]',
    standalone: true,
    imports: [RdxSwitchRootDirective, RdxSwitchInputDirective, RdxSwitchThumbDirective],
    hostDirectives: [
        {
            directive: RdxSwitchRootDirective,
            inputs: ['id', 'defaultChecked', 'checked', 'disabled', 'required']
        }
    ],
    host: {
        role: 'button',
        '[class]': 'hostClass()',
        '[attr.data-radius]': 'radius()'
    },
    template: `
        <input [id]="elementId()" rdxSwitchInput />
        <span [class]="thumbClass()" rdxSwitchThumb></span>
    `
})
export class RdxThemeSwitchComponent {
    readonly elementId = input<string | null>(null);

    readonly radius = input<radii>();

    readonly color = input<RadixColor>();

    readonly variant = input<SwitchVariant>('surface');

    readonly size = input<number, NumberInput>(2, { transform: numberAttribute });

    readonly highContrast = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected hostClass = computed(() =>
        classNames(
            'rt-reset',
            'rt-SwitchRoot',
            this.size() && `rt-r-size-${this.size()}`,
            this.variant() && `rt-variant-${this.variant()}`,
            this.highContrast() && `rt-high-contrast`
        )
    );

    protected thumbClass = computed(() => classNames('rt-SwitchThumb', this.highContrast() && `rt-high-contrast`));
}
