# Button — Disabled

> One example from the [Button](../components/button.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

The first button uses the native `disabled` attribute (removed from the tab order). The second sets
`focusableWhenDisabled`, so it stays focusable via `aria-disabled` while its activation is suppressed.
Disabled Button also suppresses consumer click, pointerdown, mousedown, keydown and keyup handlers.
Tab and composite arrow navigation remain available; hover and release handlers remain available.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

/**
 * Disabled handling. The first button uses the native `disabled` attribute
 * (removed from the tab order). The second sets `focusableWhenDisabled`, so it
 * stays focusable via `aria-disabled` while its activation is suppressed.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-disabled',
    imports: [RdxButtonDirective],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button class="demo-button demo-button-primary h-9 px-4" rdxButton disabled>Disabled</button>
            <button class="demo-button demo-button-outline h-9 px-4" rdxButton disabled focusableWhenDisabled>
                Disabled (focusable)
            </button>
        </div>
    `
})
export class RdxButtonDisabledComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
