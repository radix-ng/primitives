# Toggle — Default

> One example from the [Toggle](../components/toggle.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideHeart } from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'toggle-default-example',
    imports: [RdxToggle, LucideHeart],
    template: `
        <button
            class="demo-button demo-button-ghost group size-8 active:bg-neutral-200 dark:active:bg-neutral-700"
            rdxToggle
            aria-label="Favorite"
        >
            <svg class="group-data-pressed:fill-current" lucideHeart size="16" aria-hidden="true"></svg>
        </button>
    `
})
export class ToggleDefaultExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` for the icons.
