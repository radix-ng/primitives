# Switch — Read-only

> One example from the [Switch](../components/switch.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A `readonly` switch is focusable and announced, but cannot be toggled.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchInput, RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'switch-readonly-example',
    imports: [RdxLabelDirective, RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <label
            class="text-foreground flex items-center gap-3 text-sm font-medium"
            rdxLabel
            htmlFor="airplane-mode-readonly"
        >
            Airplane mode
            <button
                class="bg-muted data-[checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="airplane-mode-readonly"
                rdxSwitchRoot
                readonly
                defaultChecked
            >
                <input rdxSwitchInput />
                <span
                    class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]"
                    rdxSwitchThumb
                ></span>
            </button>
        </label>
    `
})
export class SwitchReadonlyExample {}
```
