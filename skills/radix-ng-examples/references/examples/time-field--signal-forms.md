# Time Field — Signal Forms

> One example from the [Time Field](../components/time-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Bind `[formField]` directly to the root. Segment edits update the time model, and Reset restores its
initial value. No extra input is needed for Signal Forms.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { TimeValue } from '@radix-ng/primitives/core';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'time-field-signal-forms-example',
    imports: [FormField, RdxTimeFieldRootDirective, RdxTimeFieldInputDirective],
    template: `
        <div class="flex flex-col items-start gap-3">
            <span class="text-foreground text-sm font-medium" id="signal-time-label">Appointment time</span>
            <div
                class="border-border bg-background text-foreground inline-flex items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none"
                #root="rdxTimeFieldRoot"
                [formField]="timeForm.time"
                [hourCycle]="24"
                aria-labelledby="signal-time-label"
                locale="en-US"
                rdxTimeFieldRoot
            >
                @for (item of root.segmentContents(); track $index) {
                    <span
                        class="data-[placeholder]:text-muted-foreground hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                        [part]="item.part"
                        rdxTimeFieldInput
                    >
                        {{ item.value }}
                    </span>
                }
            </div>
            <output class="text-muted-foreground text-sm">
                <span class="sr-only">Selected time:</span>
                {{ model().time?.toString() ?? 'No time selected' }}
            </output>
            <button class="demo-button demo-button-outline" (click)="timeForm().reset({ time: null })" type="button">
                Reset
            </button>
        </div>
    `
})
export class TimeFieldSignalFormsExample {
    readonly model = signal<{ time: TimeValue | null }>({ time: null });
    readonly timeForm = form(this.model);
}
```
