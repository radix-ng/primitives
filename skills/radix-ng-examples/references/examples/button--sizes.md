# Button — Sizes

> One example from the [Button](../components/button.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

`sm`, `md`, `lg`, and a square `icon` size.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon, LucidePlus } from '@lucide/angular';
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';

/**
 * Sizes, including a square icon button.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-sizes',
    imports: [RdxButtonDirective, LucideDynamicIcon, LucidePlus],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxButton>Small</button>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxButton>Medium</button>
            <button [class]="cn(b.base, b.primary, b.size.lg)" rdxButton>Large</button>
            <button [class]="cn(b.base, b.primary, b.size.icon)" rdxButton aria-label="Add">
                <svg class="flex" lucidePlus size="16" />
            </button>
        </div>
    `
})
export class RdxButtonSizesComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
```
