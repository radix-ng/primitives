# Menu — CSS animations

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Animate the popup itself so its transition status and the portal share the same render lifetime.
Popup and Backdrop register their animation elements automatically; add `rdxPresenceTarget` for
another animated element inside the portal. Keep the popup displayed during the exit;
a closed-state `display: none` would cancel the animation immediately. The parent Positioner hides
once the transition finishes, including when the portal stays mounted.

The example uses the shared Tailwind demo animation utilities. Consumers can bring equivalent
CSS. Key entry and exit keyframes on `data-open` and `data-closed` so the exit starts on the first
closed render, without waiting for a later transition-status render. Popper positions the outer element, leaving
popup transforms free for animation.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-animated',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Animated</button>
            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-menu-popup data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out min-w-[8rem] origin-[var(--transform-origin)] p-1 data-[closed]:pointer-events-none data-[closed]:block! data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        New Tab
                    </button>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        New Window
                    </button>
                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Print…
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuAnimatedComponent {}
```

```html
<ng-template rdxMenuPortal>
    <div [class]="m.positioner" rdxMenuPositioner>
        <div [class]="cn(m.popup, m.popupAnimated)" rdxMenuPopup>…items…</div>
    </div>
</ng-template>
```

#### `onOpenChangeComplete`

Bind `(onOpenChangeComplete)` on `rdxMenuRoot` to run logic after the popup has fully appeared or
disappeared:

```html
<ng-container #root="rdxMenuRoot" (onOpenChangeComplete)="onDone($event)" rdxMenuRoot>
```

The event carries `true` when the open animation finishes and `false` when the accepted close has
finished: after the portal view exits, or after CSS completes for a retained portal. Each accepted
close completes once. Reopening during an exit cancels the old close completion.

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`. Copy the component from **Show code** and any shared files below,
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
