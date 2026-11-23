# Button — Loading

> One example from the [Button](../components/button.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

For buttons that enter a loading state after being clicked, set `disabled` while pending together
with `focusableWhenDisabled` so focus stays on the button. Add `aria-busy` and render a spinner to
communicate the state.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideDynamicIcon, LucideLoaderCircle, LucideSave } from '@lucide/angular';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

/**
 * Loading state. Following Base UI's guidance, the button becomes `disabled`
 * while loading but uses `focusableWhenDisabled` so focus stays on it. `aria-busy`
 * announces the pending state, and a spinner is rendered in place of the icon.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-loading',
    imports: [RdxButtonDirective, LucideDynamicIcon],
    template: `
        <button
            class="demo-button demo-button-outline h-8 px-3"
            [disabled]="loading()"
            [attr.aria-busy]="loading() ? 'true' : null"
            (click)="run()"
            rdxButton
            focusableWhenDisabled
        >
            <svg
                class="flex"
                [lucideIcon]="loading() ? loaderIcon : saveIcon"
                [class.animate-spin]="loading()"
                size="16"
            />
            {{ loading() ? 'Saving…' : 'Save' }}
        </button>
    `
})
export class RdxButtonLoadingComponent {
    protected readonly loaderIcon = LucideLoaderCircle;
    protected readonly saveIcon = LucideSave;
    protected readonly loading = signal(false);

    protected run(): void {
        if (this.loading()) {
            return;
        }
        this.loading.set(true);
        setTimeout(() => this.loading.set(false), 2000);
    }
}
```

```html
<button rdxButton>Button</button>

<!-- disabled but still focusable -->
<button rdxButton disabled focusableWhenDisabled>Disabled</button>

<!-- render a link as a button -->
<a rdxButton href="/docs">Docs</a>
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
