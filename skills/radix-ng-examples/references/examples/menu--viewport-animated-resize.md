# Menu — Viewport (animated resize)

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Wrap the popup content in `rdxMenuViewport` to smoothly animate the popup size when the content
changes — for example revealing an advanced section, or switching between menubar menus of different
sizes. The viewport measures content and exposes `--popup-width` / `--popup-height`; bind them on
the popup with a CSS transition (here via Tailwind arbitrary utilities, so no story-local CSS):

```html
<div
    [class]="cn(m.popup, 'overflow-hidden [width:var(--popup-width)] [height:var(--popup-height)] transition-[width,height] duration-200')"
    rdxMenuPopup
>
    <div rdxMenuViewport>…items…</div>
</div>
```

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger,
    RdxMenuViewport
} from '@radix-ng/primitives/menu';

/**
 * Demonstrates `rdxMenuViewport`: the popup smoothly resizes as its content
 * changes size. The viewport measures the content and exposes `--popup-width` /
 * `--popup-height`; the popup binds them with a CSS transition (expressed here
 * with Tailwind arbitrary utilities, so no story-local CSS is needed).
 */
@Component({
    selector: 'rdx-menu-viewport',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuViewport,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Settings</button>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-menu-popup [height:var(--popup-height)] [width:var(--popup-width)] min-w-[8rem] overflow-hidden p-1 transition-[width,height] duration-200 ease-out data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <div rdxMenuViewport>
                        <div class="w-56">
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                [closeOnClick]="false"
                                (onSelect)="toggle()"
                                rdxMenuItem
                            >
                                {{ expanded() ? 'Hide advanced' : 'Show advanced' }}
                            </button>
                            <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                rdxMenuItem
                            >
                                Profile
                            </button>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                rdxMenuItem
                            >
                                Billing
                            </button>

                            @if (expanded()) {
                                <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Keyboard shortcuts
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Developer tools
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Feature flags
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    API tokens
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuViewportExampleComponent {
    readonly expanded = signal(false);

    toggle(): void {
        this.expanded.update((v) => !v);
    }
}
```

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
