# Time Field — Localization

> One example from the [Time Field](../components/time-field.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

`locale` drives segment order, separators, and the numbering system.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

interface LocaleExample {
    readonly id: string;
    readonly label: string;
    readonly locale: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'time-field-localization-example',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-4">
            @for (example of locales; track example.id) {
                <div class="flex flex-col gap-1.5">
                    <label class="text-foreground text-sm font-medium" [id]="example.id">{{ example.label }}</label>
                    <div
                        class="border-border bg-background text-foreground focus-within:ring-ring inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2"
                        #root="rdxTimeFieldRoot"
                        [locale]="example.locale"
                        [attr.aria-labelledby]="example.id"
                        granularity="second"
                        rdxTimeFieldRoot
                    >
                        @for (item of root.segmentContents(); track $index) {
                            @if (item.part === 'literal') {
                                <span class="text-muted-foreground px-px" [part]="item.part" rdxTimeFieldInput>
                                    {{ item.value }}
                                </span>
                            } @else {
                                <div
                                    class="data-[placeholder]:text-muted-foreground hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                                    [part]="item.part"
                                    rdxTimeFieldInput
                                >
                                    {{ item.value }}
                                </div>
                            }
                        }
                        <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
                    </div>
                </div>
            }
        </div>
    `
})
export class TimeFieldLocalizationExample {
    protected readonly locales: LocaleExample[] = [
        { id: 'locale-en', label: 'English (en)', locale: 'en' },
        { id: 'locale-ja', label: 'Japanese (ja)', locale: 'ja' },
        { id: 'locale-fa', label: 'Persian (fa-IR)', locale: 'fa-IR' },
        { id: 'locale-zh', label: 'Taiwan (zh-TW)', locale: 'zh-TW' }
    ];
}
```
