# Menubar — Vertical

> One example from the [Menubar](../components/menubar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Use `<rdx-menubar-default orientation="vertical" />` to render the demo vertically.
Up/Down move between the closed triggers. The cross-axis arrow opens a menu: Right in LTR, Left in RTL.
Inside the popup, Up/Down navigate its items; Escape returns to the trigger.
The return arrow (Left in LTR, Right in RTL) closes the popup and returns focus to its trigger.

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger,
    RdxMenuTrigger,
    type RdxMenuOrientation
} from '@radix-ng/primitives/menu';
import { RdxMenubarRoot, type RdxMenubarOrientation } from '@radix-ng/primitives/menubar';

@Component({
    selector: 'rdx-menubar-default',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator,
        RdxMenubarRoot,
        LucideChevronRight
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div
            class="demo-menubar-root inline-flex items-center gap-1 p-1"
            [class]="orientation() === 'vertical' ? 'w-48 flex-col items-stretch' : ''"
            [orientation]="orientation()"
            rdxMenubarRoot
        >
            <ng-container [orientation]="menuOrientation()" rdxMenuRoot>
                <button
                    class="demo-menubar-trigger data-[popup-open]:bg-muted flex h-8 shrink-0 items-center px-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    rdxMenuTrigger
                >
                    File
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        class="z-50 data-[closed]:pointer-events-none"
                        [side]="orientation() === 'vertical' ? 'inline-end' : 'bottom'"
                        align="start"
                        alignOffset="-4"
                        sideOffset="8"
                        rdxMenuPositioner
                    >
                        <div [class]="popupClass()" rdxMenuPopup>
                            <div [class]="itemClass()" rdxMenuItem>New</div>
                            <div [class]="itemClass()" rdxMenuItem>Open</div>
                            <div [class]="itemClass()" rdxMenuItem>Save</div>
                            <ng-container rdxMenuRoot>
                                <div [class]="subTriggerClass()" rdxMenuSubTrigger>
                                    Export
                                    <svg
                                        class="size-4 shrink-0"
                                        [class]="menuOrientation() === 'horizontal' ? 'rotate-90' : 'rtl:rotate-180'"
                                        lucideChevronRight
                                    ></svg>
                                </div>
                                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                    <div
                                        class="z-50 data-[closed]:pointer-events-none"
                                        [side]="menuOrientation() === 'horizontal' ? 'bottom' : 'inline-end'"
                                        [alignOffset]="menuOrientation() === 'horizontal' ? 0 : -4"
                                        sideOffset="8"
                                        align="start"
                                        rdxMenuPositioner
                                    >
                                        <div
                                            class="demo-menu-popup min-w-40! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                            rdxMenuPopup
                                        >
                                            <div
                                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                rdxMenuItem
                                            >
                                                PDF
                                            </div>
                                            <div
                                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                rdxMenuItem
                                            >
                                                PNG
                                            </div>
                                            <div
                                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                rdxMenuItem
                                            >
                                                SVG
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                            <div
                                [class]="separatorClass()"
                                [orientation]="menuOrientation() === 'horizontal' ? 'vertical' : 'horizontal'"
                                rdxMenuSeparator
                            ></div>
                            <div [class]="itemClass()" rdxMenuItem>Print</div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <ng-container [orientation]="menuOrientation()" rdxMenuRoot>
                <button
                    class="demo-menubar-trigger data-[popup-open]:bg-muted flex h-8 shrink-0 items-center px-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    rdxMenuTrigger
                >
                    Edit
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        class="z-50 data-[closed]:pointer-events-none"
                        [side]="orientation() === 'vertical' ? 'inline-end' : 'bottom'"
                        align="start"
                        alignOffset="-4"
                        sideOffset="8"
                        rdxMenuPositioner
                    >
                        <div [class]="popupClass()" rdxMenuPopup>
                            <div [class]="itemClass()" rdxMenuItem>Cut</div>
                            <div [class]="itemClass()" rdxMenuItem>Copy</div>
                            <div [class]="itemClass()" rdxMenuItem>Paste</div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <ng-container [orientation]="menuOrientation()" rdxMenuRoot>
                <button
                    class="demo-menubar-trigger data-[popup-open]:bg-muted flex h-8 shrink-0 items-center px-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    rdxMenuTrigger
                >
                    View
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        class="z-50 data-[closed]:pointer-events-none"
                        [side]="orientation() === 'vertical' ? 'inline-end' : 'bottom'"
                        align="start"
                        alignOffset="-4"
                        sideOffset="8"
                        rdxMenuPositioner
                    >
                        <div [class]="popupClass()" rdxMenuPopup>
                            <div [class]="itemClass()" rdxMenuItem>Zoom In</div>
                            <div [class]="itemClass()" rdxMenuItem>Zoom Out</div>
                            <ng-container rdxMenuRoot>
                                <div [class]="subTriggerClass()" rdxMenuSubTrigger>
                                    Layout
                                    <svg
                                        class="size-4 shrink-0"
                                        [class]="menuOrientation() === 'horizontal' ? 'rotate-90' : 'rtl:rotate-180'"
                                        lucideChevronRight
                                    ></svg>
                                </div>
                                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                    <div
                                        class="z-50 data-[closed]:pointer-events-none"
                                        [side]="menuOrientation() === 'horizontal' ? 'bottom' : 'inline-end'"
                                        [alignOffset]="menuOrientation() === 'horizontal' ? 0 : -4"
                                        sideOffset="8"
                                        align="start"
                                        rdxMenuPositioner
                                    >
                                        <div
                                            class="demo-menu-popup min-w-40! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                            rdxMenuPopup
                                        >
                                            <div
                                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                rdxMenuItem
                                            >
                                                Single Page
                                            </div>
                                            <div
                                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                rdxMenuItem
                                            >
                                                Two Pages
                                            </div>
                                            <div
                                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                rdxMenuItem
                                            >
                                                Continuous
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                            <div
                                [class]="separatorClass()"
                                [orientation]="menuOrientation() === 'horizontal' ? 'vertical' : 'horizontal'"
                                rdxMenuSeparator
                            ></div>
                            <div [class]="itemClass()" rdxMenuItem>Full Screen</div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <ng-container [disabled]="true" [orientation]="menuOrientation()" rdxMenuRoot>
                <button
                    class="demo-menubar-trigger data-[popup-open]:bg-muted flex h-8 shrink-0 items-center px-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    rdxMenuTrigger
                >
                    Help
                </button>
            </ng-container>
        </div>
    `
})
export class RdxMenubarDefaultComponent {
    readonly orientation = input<RdxMenubarOrientation>('horizontal');
    readonly keepMounted = input(false);
    readonly menuOrientation = input<RdxMenuOrientation>('vertical');
    protected readonly popupClass = computed(() =>
        [
            'demo-menu-popup min-w-[8rem] p-1 data-[closed]:hidden data-[closed]:pointer-events-none',
            this.menuOrientation() === 'horizontal' ? 'flex gap-1' : 'min-w-44!'
        ]
            .filter(Boolean)
            .join(' ')
    );
    protected readonly itemClass = computed(() =>
        [
            'demo-menu-item relative flex w-full items-center gap-2 px-2 py-1.5 data-[highlighted]:bg-muted data-[highlighted]:outline data-[highlighted]:outline-1 data-[highlighted]:outline-border data-[disabled]:opacity-50',
            this.menuOrientation() === 'horizontal' && 'w-auto! whitespace-nowrap'
        ]
            .filter(Boolean)
            .join(' ')
    );
    protected readonly subTriggerClass = computed(() =>
        [this.itemClass(), 'justify-between gap-6! data-[popup-open]:bg-muted'].filter(Boolean).join(' ')
    );
    protected readonly separatorClass = computed(() =>
        this.menuOrientation() === 'horizontal' ? 'bg-border mx-1 w-px self-stretch' : '-mx-1 my-1 h-px bg-border'
    );
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
