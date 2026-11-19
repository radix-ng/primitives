# Preview Card — Controlled Multiple

> One example from the [Preview Card](../components/preview-card.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Control both the open state and the active trigger id.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    selector: 'rdx-preview-card-controlled-multiple',
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
            <div class="flex items-center gap-3">
                <button
                    class="demo-button demo-button-outline h-8 px-3 text-xs"
                    (click)="openFrom('design')"
                    type="button"
                >
                    Open design
                </button>
                <button class="demo-button demo-button-outline h-8 px-3 text-xs" (click)="open = false" type="button">
                    Close
                </button>
            </div>

            <ng-container
                #root="rdxPreviewCardRoot"
                [(open)]="open"
                [(triggerId)]="triggerId"
                (onOpenChange)="triggerId = $event.triggerId"
                rdxPreviewCardRoot
            >
                <p class="text-muted-foreground max-w-lg text-sm leading-6">
                    Discover
                    <a
                        class="text-primary demo-focus font-medium underline underline-offset-4"
                        id="typography"
                        [payload]="cards.typography"
                        href="#"
                        rdxPreviewCardTrigger
                    >
                        typography
                    </a>
                    ,
                    <a
                        class="text-primary demo-focus font-medium underline underline-offset-4"
                        id="design"
                        [payload]="cards.design"
                        href="#"
                        rdxPreviewCardTrigger
                    >
                        design
                    </a>
                    , or
                    <a
                        class="text-primary demo-focus font-medium underline underline-offset-4"
                        id="art"
                        [payload]="cards.art"
                        href="#"
                        rdxPreviewCardTrigger
                    >
                        art
                    </a>
                    .
                </p>

                <div class="z-50" *rdxPreviewCardPortal sideOffset="8" rdxPreviewCardPositioner>
                    <div class="demo-surface relative w-80 p-4" rdxPreviewCardPopup>
                        <span class="text-card demo-arrow my-px" rdxPreviewCardArrow></span>
                        <div class="grid gap-2">
                            <div class="bg-muted h-24 rounded-md"></div>
                            <p class="text-muted-foreground text-sm">{{ root.payload() }}</p>
                        </div>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPreviewCardControlledMultipleComponent {
    open = false;
    triggerId: string | null = null;
    protected readonly cards = {
        typography: 'Typography arranges type to make written language clear and effective.',
        design: 'Design shapes the concept and structure of an object, process, or system.',
        art: 'Art communicates ideas and emotion through creative work.'
    } as const;

    openFrom(id: 'typography' | 'design' | 'art') {
        this.triggerId = id;
        this.open = true;
    }
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
