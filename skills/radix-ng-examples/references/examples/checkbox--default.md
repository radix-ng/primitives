# Checkbox — Default

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

The preview above uses this standalone component. Copy the setup and shared files below as well.

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-checkbox-default-example',
    imports: [
        LucideCheck,

        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxRootDirective
    ],
    template: `
        <div class="flex items-center gap-2">
            <div [readOnly]="readOnly()" [disabled]="disabled()" [checked]="true" rdxCheckboxRoot>
                <button class="demo-choice size-4" id="checkbox-1" rdxCheckboxButton>
                    <svg
                        class="flex items-center"
                        *rdxCheckboxIndicatorPresence
                        rdxCheckboxIndicator
                        size="12"
                        lucideCheck
                    />
                </button>
            </div>
            <label class="text-foreground flex items-center text-sm" for="checkbox-1">
                Accept terms and conditions.
            </label>
        </div>
    `
})
export class CheckboxDefaultStory {
    readonly readOnly = input(false);
    readonly disabled = input(false);
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
