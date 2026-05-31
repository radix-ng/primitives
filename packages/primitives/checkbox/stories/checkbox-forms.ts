import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { LucideAngularModule } from 'lucide-angular';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

@Component({
    selector: 'checkbox-groups-forms-example',
    template: `
        <section [formGroup]="personality">
            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="fun">
                    <button
                        class="border-border bg-background focus-visible:ring-ring flex size-6 items-center justify-center rounded-md border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="r1"
                        rdxCheckboxButton
                    >
                        <lucide-angular
                            class="text-primary flex items-center data-[state=unchecked]:hidden"
                            rdxCheckboxIndicator
                            size="16"
                            name="check"
                        />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r1">Fun</label>
            </div>

            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="serious">
                    <button
                        class="border-border bg-background focus-visible:ring-ring flex size-6 items-center justify-center rounded-md border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="r2"
                        rdxCheckboxButton
                    >
                        <lucide-angular
                            class="text-primary flex items-center data-[state=unchecked]:hidden"
                            rdxCheckboxIndicator
                            size="16"
                            name="check"
                        />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r2">
                    Serious
                </label>
            </div>

            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="smart" form="smart">
                    <button
                        class="border-border bg-background focus-visible:ring-ring flex size-6 items-center justify-center rounded-md border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="r3"
                        rdxCheckboxButton
                    >
                        <lucide-angular
                            class="text-primary flex items-center data-[state=unchecked]:hidden"
                            rdxCheckboxIndicator
                            size="16"
                            name="check"
                        />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r3">Smart</label>
            </div>
        </section>

        <section class="text-muted-foreground mb-3 flex items-center text-sm" [formGroup]="personality">
            <h4 class="font-medium">You chose:&nbsp;</h4>
            {{ personality.value | json }}
        </section>

        <button
            class="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex h-9 items-center rounded-md px-3 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
            (click)="toggleDisable()"
            type="button"
        >
            Toggle disabled state
        </button>
    `,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        JsonPipe,
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        LucideAngularModule,
        RdxCheckboxInputDirective
    ]
})
export class CheckboxReactiveFormsExampleComponent {
    private readonly formBuilder = inject(FormBuilder);

    personality = this.formBuilder.group({
        fun: false,
        serious: false,
        smart: false
    });

    toggleDisable() {
        const checkbox = this.personality.get('serious');
        if (checkbox != null) {
            checkbox.disabled ? checkbox.enable() : checkbox.disable();
        }
    }
}
