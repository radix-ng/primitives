# Radio Group — Disabled

> One example from the [Radio Group](../components/radio.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A disabled radio group ignores user interaction and exposes disabled state attributes to all items.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'radio-disabled-example',
    template: `
        <div
            class="flex flex-col gap-2.5"
            [value]="'comfortable'"
            rdxRadioRoot
            name="density-disabled"
            disabled
            aria-label="View density"
        >
            <label class="flex items-center gap-3">
                <span
                    class="demo-radio-item demo-focus flex size-6 items-center justify-center disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxRadioItem
                    value="default"
                >
                    <span
                        class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                        rdxRadioIndicator
                    ></span>
                    <input rdxRadioItemInput />
                </span>
                <span class="demo-label">Default</span>
            </label>
            <label class="flex items-center gap-3">
                <span
                    class="demo-radio-item demo-focus flex size-6 items-center justify-center disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxRadioItem
                    value="comfortable"
                >
                    <span
                        class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                        rdxRadioIndicator
                    ></span>
                    <input rdxRadioItemInput />
                </span>
                <span class="demo-label">Comfortable</span>
            </label>
            <label class="flex items-center gap-3">
                <span
                    class="demo-radio-item demo-focus flex size-6 items-center justify-center disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxRadioItem
                    value="compact"
                >
                    <span
                        class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                        rdxRadioIndicator
                    ></span>
                    <input rdxRadioItemInput />
                </span>
                <span class="demo-label">Compact</span>
            </label>
        </div>
    `,
    imports: [RdxRadioItemDirective, RdxRadioItemInputDirective, RdxRadioIndicatorDirective, RdxRadioGroupDirective]
})
export class RadioDisabledComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
