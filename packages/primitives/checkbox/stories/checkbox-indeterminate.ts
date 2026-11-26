import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { LucideCheck, LucideDynamicIcon, LucideMinus } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-indeterminate-example',
    imports: [
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        LucideDynamicIcon,
        RdxCheckboxInputDirective,
        JsonPipe
    ],
    template: `
        <div class="flex items-center gap-3">
            <div
                [controlledChecked]="checked()"
                [indeterminate]="indeterminate()"
                (onCheckedChange)="checked.set($event.checked); indeterminate.set(false)"
                rdxCheckboxRoot
            >
                <button
                    class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    id="r1"
                    rdxCheckboxButton
                >
                    <svg
                        class="text-primary flex items-center"
                        *rdxCheckboxIndicatorPresence
                        [lucideIcon]="icon()"
                        rdxCheckboxIndicator
                        size="16"
                    />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="text-foreground flex items-center text-sm font-medium" for="r1">I'm a checkbox</label>
        </div>

        <section class="text-muted-foreground mt-3 text-sm">
            <p>checked:&nbsp;{{ checked() | json }}</p>
            <p>indeterminate:&nbsp;{{ indeterminate() | json }}</p>
        </section>

        <button class="demo-button demo-button-primary mt-3 h-9 px-4" (click)="toggleIndeterminate()" type="button">
            Toggle Indeterminate state
        </button>
    `
})
export class CheckboxIndeterminate {
    readonly checked = model<boolean>(false);
    readonly indeterminate = model<boolean>(false);

    // `checked` and `indeterminate` are orthogonal; the mixed state takes visual priority.
    readonly icon = computed(() => (this.indeterminate() ? LucideMinus : LucideCheck));

    toggleIndeterminate() {
        this.indeterminate.update((value) => !value);
    }
}
