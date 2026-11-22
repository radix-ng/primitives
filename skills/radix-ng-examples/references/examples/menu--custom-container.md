# Menu — Custom container

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Bind a native element or `ElementRef` to the Portal's `container`. An explicit `null` waits without
creating the popup, even with `keepMounted`; an omitted value or `undefined` uses the default body
container. A signal query can supply the target when it appears:
`[container]="target()?.nativeElement ?? null"`.

Open Actions before creating the container. The example also supplies an authored GroupLabel id.

```typescript
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import {
    RdxMenuGroup,
    RdxMenuGroupLabel,
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-custom-container',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuGroup,
        RdxMenuGroupLabel
    ],
    template: `
        <div class="flex w-80 flex-col gap-4">
            <button class="demo-button demo-button-outline h-9 px-4" (click)="showTarget.update(toggle)">
                {{ showTarget() ? 'Remove container' : 'Create container' }}
            </button>
            <ng-container [modal]="false" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Actions</button>
                <ng-template [container]="target()?.nativeElement ?? null" rdxMenuPortal>
                    <div class="z-50 data-[closed]:pointer-events-none" sideOffset="4" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <div rdxMenuGroup>
                                <div
                                    class="demo-menu-group-label px-2 py-1.5"
                                    id="custom-commands-label"
                                    rdxMenuGroupLabel
                                >
                                    Commands
                                </div>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    (onSelect)="selected.set('Edit')"
                                    rdxMenuItem
                                >
                                    Edit
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    (onSelect)="selected.set('Duplicate')"
                                    rdxMenuItem
                                >
                                    Duplicate
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <output class="text-muted-foreground text-sm">
                {{ target() ? 'Container ready' : 'Waiting for container' }} · Selected: {{ selected() }}
            </output>
            @if (showTarget()) {
                <div #portalTarget data-testid="menu-portal-target"></div>
            }
        </div>
    `
})
export class RdxMenuCustomContainerComponent {
    readonly showTarget = signal(false);
    readonly target = viewChild<ElementRef<HTMLElement>>('portalTarget');
    readonly selected = signal('none');
    readonly toggle = (value: boolean) => !value;
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
