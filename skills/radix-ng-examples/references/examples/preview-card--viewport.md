# Preview Card — Viewport

> One example from the [Preview Card](../components/preview-card.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Animate content changes when different triggers render different payloads.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxPreviewCardArrow,
    RdxPreviewCardPopup,
    RdxPreviewCardPortal,
    RdxPreviewCardPositioner,
    RdxPreviewCardRoot,
    RdxPreviewCardTrigger,
    RdxPreviewCardViewport
} from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-viewport',
    imports: [
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger,
        RdxPreviewCardPortal,
        RdxPreviewCardPositioner,
        RdxPreviewCardPopup,
        RdxPreviewCardArrow,
        RdxPreviewCardViewport
    ],
    template: `
        <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot>
            <p class="text-muted-foreground max-w-lg text-sm leading-6">
                Compare
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    href="#"
                    payload="Typography arranges type for readable language."
                    rdxPreviewCardTrigger
                >
                    typography
                </a>
                ,
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    href="#"
                    payload="Design shapes objects and systems."
                    rdxPreviewCardTrigger
                >
                    design
                </a>
                , and
                <a
                    class="text-primary demo-focus font-medium underline underline-offset-4"
                    href="#"
                    payload="Art communicates ideas through creative work."
                    rdxPreviewCardTrigger
                >
                    art
                </a>
                .
            </p>

            <div
                class="z-50 transition-[left,right,top,bottom] duration-200"
                *rdxPreviewCardPortal
                sideOffset="8"
                rdxPreviewCardPositioner
            >
                <div
                    class="demo-surface relative w-80 overflow-hidden p-4 transition-[width,height] duration-200"
                    rdxPreviewCardPopup
                >
                    <span class="text-card demo-arrow my-px" rdxPreviewCardArrow></span>
                    <div rdxPreviewCardViewport>
                        <div class="grid gap-2">
                            <div class="bg-muted h-24 rounded-md"></div>
                            <p class="text-muted-foreground text-sm">{{ root.payload() }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPreviewCardViewportComponent {}
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
