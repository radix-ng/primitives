# Context Menu — Default

> One example from the [Context Menu](../components/context-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

A right-click area with shortcuts, a disabled item, a submenu, checkbox items, and a radio group.
Right-click the dashed area to open the menu at the pointer.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { RdxContextMenuRoot, RdxContextMenuTrigger } from '@radix-ng/primitives/context-menu';
import {
    RdxMenuCheckboxItem,
    RdxMenuCheckboxItemIndicator,
    RdxMenuGroupLabel,
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRadioGroup,
    RdxMenuRadioItem,
    RdxMenuRadioItemIndicator,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-context-menu-default',
    imports: [
        RdxContextMenuRoot,
        RdxContextMenuTrigger,
        RdxMenuRoot,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuGroupLabel,
        RdxMenuSeparator,
        RdxMenuCheckboxItem,
        RdxMenuCheckboxItemIndicator,
        RdxMenuRadioGroup,
        RdxMenuRadioItem,
        RdxMenuRadioItemIndicator,
        LucideCheck
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div
                class="demo-menu-context-area data-[popup-open]:bg-muted flex h-[150px] w-[300px] max-w-full items-center justify-center p-4 data-[popup-open]:border-solid"
                tabindex="0"
                rdxContextMenuTrigger
            >
                Right click here
            </div>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal rdxMenuPositioner>
                <div
                    class="demo-menu-popup min-w-56! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Back
                        <span class="text-muted-foreground ml-auto pl-4 text-xs">⌘ [</span>
                    </button>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        [disabled]="true"
                        rdxMenuItem
                    >
                        Forward
                        <span class="text-muted-foreground ml-auto pl-4 text-xs">⌘ ]</span>
                    </button>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Reload
                        <span class="text-muted-foreground ml-auto pl-4 text-xs">⌘ R</span>
                    </button>

                    <!-- More Tools submenu -->
                    <ng-container #moreSub="rdxMenuRoot" rdxMenuRoot>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuSubTrigger
                        >
                            More Tools
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>
                        <div
                            class="z-50 data-[closed]:pointer-events-none"
                            *rdxMenuPortal
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                        >
                            <div
                                class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                rdxMenuPopup
                            >
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Save Page As…
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Create Shortcut…
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Name Window…
                                </button>
                            </div>
                        </div>
                    </ng-container>

                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>

                    <button
                        class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        [(checked)]="showBookmarks"
                        type="button"
                        rdxMenuCheckboxItem
                    >
                        <span
                            class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                            aria-hidden="true"
                            rdxMenuCheckboxItemIndicator
                        >
                            <svg [size]="12" lucideCheck></svg>
                        </span>
                        Show Bookmarks
                        <span class="text-muted-foreground ml-auto pl-4 text-xs">⌘ B</span>
                    </button>
                    <button
                        class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        [(checked)]="showFullUrls"
                        type="button"
                        rdxMenuCheckboxItem
                    >
                        <span
                            class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                            aria-hidden="true"
                            rdxMenuCheckboxItemIndicator
                        >
                            <svg [size]="12" lucideCheck></svg>
                        </span>
                        Show Full URLs
                    </button>

                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>

                    <div [(value)]="person" rdxMenuRadioGroup>
                        <div class="demo-menu-group-label px-2 py-1.5 ps-8" rdxMenuGroupLabel>People</div>
                        <button
                            class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            type="button"
                            value="pedro"
                            rdxMenuRadioItem
                        >
                            <span
                                class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                                aria-hidden="true"
                                rdxMenuRadioItemIndicator
                            >
                                <span class="size-2 shrink-0 rounded-full bg-current"></span>
                            </span>
                            Pedro Duarte
                        </button>
                        <button
                            class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            type="button"
                            value="colm"
                            rdxMenuRadioItem
                        >
                            <span
                                class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                                aria-hidden="true"
                                rdxMenuRadioItemIndicator
                            >
                                <span class="size-2 shrink-0 rounded-full bg-current"></span>
                            </span>
                            Colm Tuite
                        </button>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxContextMenuDefaultComponent {
    showBookmarks = signal(true);
    showFullUrls = signal(false);
    person = signal<string | undefined>('pedro');
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
