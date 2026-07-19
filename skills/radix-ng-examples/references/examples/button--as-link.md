# Button — As link

> One example from the [Button](../components/button.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

The directive applies button semantics to any element. Here an `<a>` renders as a button while
keeping native link behavior.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';

/**
 * The directive works on any host. Here it renders an `<a>` as a button while
 * keeping native link behavior.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-as-link',
    imports: [RdxButtonDirective],
    template: `
        <a [class]="cn(b.base, b.secondary, b.size.md)" rdxButton href="https://base-ui.com" target="_blank">
            Open Base UI
        </a>
    `
})
export class RdxButtonAsLinkComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
```
