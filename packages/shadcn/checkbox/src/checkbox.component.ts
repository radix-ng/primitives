// This code is an adaptation of code from https://ui.shadcn.com/docs.

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { RdxCheckboxDirective, RdxCheckboxIndicatorDirective } from '@radix-ng/primitives/checkbox';
import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { LucideAngularModule } from 'lucide-angular';

const variants = cva('');

@Component({
    selector: 'sh-checkbox',
    standalone: true,
    imports: [RdxCheckboxDirective, RdxCheckboxIndicatorDirective, LucideAngularModule],
    host: {
        '[class]': 'computedClass()'
    },
    template: `
        <button
            rdxCheckbox
            class="border-primary ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer h-4 w-4 shrink-0 rounded-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <lucide-angular
                rdxCheckboxIndicator
                name="check"
                class="flex h-4 items-center justify-center text-current data-[state=unchecked]:hidden"
            ></lucide-angular>
            <input
                rdxCheckboxIndicator
                type="checkbox"
                aria-hidden="true"
                tabindex="-1"
                [id]="idLabel()"
                value="on"
                class="cdk-visually-hidden"
            />
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './checkbox.styles.scss'
})
export class ShCheckboxComponent {
    readonly idLabel = input<string>();

    readonly class = input<string>();

    protected computedClass = computed(() => cn(variants({ class: this.class() })));
}
