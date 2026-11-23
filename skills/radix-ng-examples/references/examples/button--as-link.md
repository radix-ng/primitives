# Button — As link

> One example from the [Button](../components/button.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The directive applies button semantics to any element. Here an `<a>` renders as a button while
keeping native link behavior.

Enter uses the browser's native link activation when `href` is present. Space prevents scrolling
and activates on keyup. Keyboard events from a focusable descendant do not activate the outer button.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

/**
 * The directive works on any host. Here it renders an `<a>` as a button while
 * keeping native link behavior.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-as-link',
    imports: [RdxButtonDirective],
    template: `
        <a class="demo-button demo-button-secondary h-9 px-4" rdxButton href="https://base-ui.com" target="_blank">
            Open Base UI
        </a>
    `
})
export class RdxButtonAsLinkComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
