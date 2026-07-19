# Button — Loading

> One example from the [Button](../components/button.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

For buttons that enter a loading state after being clicked, set `disabled` while pending together
with `focusableWhenDisabled` so focus stays on the button. Add `aria-busy` and render a spinner to
communicate the state.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideDynamicIcon, LucidePlus } from '@lucide/angular';
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';

/**
 * Loading state. Following Base UI's guidance, the button becomes `disabled`
 * while loading but uses `focusableWhenDisabled` so focus stays on it. `aria-busy`
 * announces the pending state, and a spinner is rendered in place of the icon.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-loading',
    imports: [RdxButtonDirective, LucideDynamicIcon, LucidePlus],
    template: `
        <button
            [disabled]="loading()"
            [attr.aria-busy]="loading() ? 'true' : null"
            [class]="cn(b.base, b.primary, b.size.md)"
            (click)="run()"
            rdxButton
            focusableWhenDisabled
        >
            <svg
                class="flex"
                [lucideIcon]="loading() ? 'loader-circle' : 'save'"
                [class.animate-spin]="loading()"
                size="16"
            />
            {{ loading() ? 'Saving…' : 'Save' }}
        </button>
    `
})
export class RdxButtonLoadingComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
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
