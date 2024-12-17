import { booleanAttribute, Component, computed, input, model, numberAttribute } from '@angular/core';

import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { radii, RadixColor } from '@radix-ng/components/types';
import { RdxSwitchInputDirective, RdxSwitchRootDirective, RdxSwitchThumbDirective } from '@radix-ng/primitives/switch';
import classNames from 'classnames';

export type SwitchVariant = 'classic' | 'surface' | 'soft';

let idIterator = 0;

@Component({
    selector: 'rdx-theme-switch',
    standalone: true,
    imports: [RdxSwitchRootDirective, RdxSwitchInputDirective, RdxSwitchThumbDirective],
    template: `
        <button
            [class]="computedClass()"
            [id]="elementId()"
            [checked]="checked()"
            [defaultChecked]="defaultChecked() ? defaultChecked() : null"
            [disabled]="disabled()"
            [attr.data-radius]="radius()"
            [attr.data-accent-color]="color()"
            rdxSwitchRoot
        >
            <input rdxSwitchInput />
            <span [class]="componentThumbClass()" rdxSwitchThumb></span>
        </button>
    `
})
export class RdxThemeSwitchComponent {
    readonly id = input<string>(`rdx-switch-${idIterator++}`);

    readonly checked = model<boolean>(false);

    /**
     * The state of the switch.
     * If `defaultChecked` is provided, it takes precedence over the `checked` state.
     * @ignore
     */
    readonly defaultChecked = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly radius = input<radii>();

    readonly color = input<RadixColor>();

    readonly variant = input<SwitchVariant>('surface');

    readonly size = input<number, NumberInput>(2, { transform: numberAttribute });

    readonly highContrast = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly elementId = computed(() => (this.id() ? this.id() : null));

    protected computedClass = computed(() =>
        classNames(
            'rt-reset',
            'rt-SwitchRoot',
            this.size() && `rt-r-size-${this.size()}`,
            this.variant() && `rt-variant-${this.variant()}`,
            this.highContrast() && `rt-high-contrast`
        )
    );

    protected componentThumbClass = computed(() =>
        classNames('rt-SwitchThumb', this.highContrast() && `rt-high-contrast`)
    );
}
