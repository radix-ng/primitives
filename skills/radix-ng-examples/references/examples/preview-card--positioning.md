# Preview Card — Positioning

> One example from the [Preview Card](../components/preview-card.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Configure side, offsets, collision behavior, and arrow padding on the positioner.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Side } from '@radix-ng/primitives/popper';
import {
    RdxPreviewCardArrow,
    RdxPreviewCardPopup,
    RdxPreviewCardPortal,
    RdxPreviewCardPositioner,
    RdxPreviewCardRoot,
    RdxPreviewCardTrigger
} from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-positioning',
    imports: [
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger,
        RdxPreviewCardPortal,
        RdxPreviewCardPositioner,
        RdxPreviewCardPopup,
        RdxPreviewCardArrow
    ],
    template: `
        <div class="grid gap-4">
            <div class="flex flex-wrap gap-2">
                @for (option of sides; track option) {
                    <button
                        class="demo-button h-8 px-3 text-xs"
                        [class]="side() === option ? 'demo-button-primary' : 'demo-button-outline'"
                        (click)="side.set(option)"
                        type="button"
                    >
                        {{ option }}
                    </button>
                }
            </div>

            <ng-container rdxPreviewCardRoot>
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    href="#"
                    rdxPreviewCardTrigger
                >
                    Hover the positioned preview card
                </a>

                <div class="z-50" *rdxPreviewCardPortal [side]="side()" sideOffset="8" rdxPreviewCardPositioner>
                    <div class="demo-surface relative w-80 p-4" rdxPreviewCardPopup>
                        <span class="text-card demo-arrow my-px" rdxPreviewCardArrow></span>
                        <p class="text-muted-foreground text-sm">
                            The positioner exposes placement attributes and CSS variables for styling.
                        </p>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPreviewCardPositioningComponent {
    protected readonly sides: Side[] = ['top', 'right', 'bottom', 'left'];
    protected readonly side = signal<Side>('bottom');
}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
