# Checkbox — Template-driven forms

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Two-way bind the root with `[(ngModel)]`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

/**
 * Template-driven forms: two-way bind the root with `[(ngModel)]`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-ngmodel-example',
    imports: [
        FormsModule,

        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxInputDirective,
        LucideCheck
    ],
    template: `
        <div class="flex items-center gap-3">
            <div [(ngModel)]="subscribed" rdxCheckboxRoot>
                <button
                    class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    id="sub"
                    rdxCheckboxButton
                >
                    <svg
                        class="text-primary flex items-center"
                        *rdxCheckboxIndicatorPresence
                        rdxCheckboxIndicator
                        size="16"
                        lucideCheck
                    />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="text-foreground text-sm font-medium" for="sub">Subscribe to the newsletter</label>
        </div>

        <p class="text-muted-foreground mt-3 text-sm">subscribed: {{ subscribed }}</p>
    `
})
export class CheckboxNgModelExample {
    subscribed = false;
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
