# Switch — Read-only

> One example from the [Switch](../components/switch.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A `readonly` switch is focusable and announced, but cannot be toggled.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'switch-readonly-example',
    imports: [RdxSwitchRoot, RdxSwitchThumb],
    template: `
        <label class="text-foreground flex items-center gap-2 text-sm" for="airplane-mode-readonly">
            Airplane mode
            <button class="demo-switch h-5 w-9 p-0.5" id="airplane-mode-readonly" rdxSwitchRoot readonly defaultChecked>
                <span
                    class="demo-switch-thumb size-3.5 data-checked:translate-x-4 rtl:data-checked:-translate-x-4"
                    rdxSwitchThumb
                ></span>
            </button>
        </label>
    `
})
export class SwitchReadonlyExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
