import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { LucideCheck as Check, LucideDynamicIcon } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-keep-mounted-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideDynamicIcon,
        JsonPipe
    ],
    template: `
        <div class="flex items-center gap-3">
            <div [checked]="checked()" (onCheckedChange)="checked.set($event.checked)" rdxCheckboxRoot>
                <button
                    class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    id="r1"
                    rdxCheckboxButton
                >
                    <svg
                        class="text-primary flex items-center"
                        [lucideIcon]="Check"
                        keepMounted
                        rdxCheckboxIndicator
                        size="16"
                    />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r1">
                I'm a checkbox
            </label>
        </div>

        <section class="text-muted-foreground mt-3 text-sm">
            <p>checked state:&nbsp;{{ checked() | json }}</p>
        </section>
    `
})
export class CheckboxKeepMountedExample {
    readonly checked = model<boolean>(false);
    protected readonly Check = Check;
}
