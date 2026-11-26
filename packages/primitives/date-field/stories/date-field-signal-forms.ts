import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { DateValue } from '@internationalized/date';
import { RdxDateFieldInputDirective, RdxDateFieldRootDirective } from '@radix-ng/primitives/date-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'date-field-signal-forms-example',
    imports: [FormField, RdxDateFieldRootDirective, RdxDateFieldInputDirective],
    template: `
        <div class="flex flex-col items-start gap-3">
            <span class="text-foreground text-sm font-medium" id="signal-date-label">Appointment date</span>
            <div
                class="border-input bg-background text-foreground inline-flex items-center rounded-md border px-3 py-2 text-sm shadow-xs select-none"
                #root="rdxDateFieldRoot"
                [formField]="dateForm.date"
                aria-labelledby="signal-date-label"
                locale="en-US"
                rdxDateFieldRoot
            >
                @for (item of root.segmentContents(); track $index) {
                    <span
                        class="hover:bg-muted focus:bg-accent focus:text-accent-foreground data-[placeholder]:text-muted-foreground rounded px-1 tabular-nums focus:outline-none"
                        [part]="item.part"
                        rdxDateFieldInput
                    >
                        {{ item.value }}
                    </span>
                }
            </div>
            <output class="text-muted-foreground text-sm">
                <span class="sr-only">Selected date:</span>
                {{ model().date?.toString() ?? 'No date selected' }}
            </output>
            <button class="demo-button demo-button-outline" (click)="dateForm().reset({ date: null })" type="button">
                Reset
            </button>
        </div>
    `
})
export class DateFieldSignalFormsExample {
    readonly model = signal<{ date: DateValue | null }>({ date: null });
    readonly dateForm = form(this.model);
}
