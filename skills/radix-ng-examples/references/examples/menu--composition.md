# Menu — Composition

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Compose Root onto the wrapper host so projected parts keep it in their declaring injector tree.
The wrapper can own Portal, Positioner and Popup in its template, with menu items supplied through
`ng-content`. Internal and projected items share one ordered collection, including native item
components composed with `hostDirectives`. Submenu triggers join their parent popup's collection;
child commands join the child popup. Keep provider-bearing groups, such as RadioGroup, on a wrapper
host when projecting their children.

```typescript
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { LucideChevronDown, LucideChevronRight } from '@lucide/angular';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'demo-menu',
    template: '<ng-content />',
    hostDirectives: [RdxMenuRoot],
    host: { class: 'contents' }
})
export class DemoMenu {}

@Component({ selector: 'button[demoMenuTrigger]', template: '<ng-content />', hostDirectives: [RdxMenuTrigger] })
export class DemoMenuTrigger {}

@Component({
    selector: 'button[demoMenuItem]',
    template: '<ng-content />',
    hostDirectives: [{ directive: RdxMenuItem, inputs: ['disabled'], outputs: ['onSelect'] }]
})
export class DemoMenuItem {}

@Component({ selector: 'button[demoMenuSubTrigger]', template: '<ng-content />', hostDirectives: [RdxMenuSubTrigger] })
export class DemoMenuSubTrigger {}

@Component({
    selector: 'demo-menu-popup',
    imports: [RdxMenuPortal, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem, RdxMenuSeparator],
    template: `
        <div
            class="z-50 data-[closed]:pointer-events-none"
            *rdxMenuPortal
            [side]="side()"
            align="start"
            sideOffset="6"
            rdxMenuPositioner
        >
            <div
                class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                rdxMenuPopup
            >
                @if (showRefresh()) {
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        (onSelect)="refresh.emit()"
                        rdxMenuItem
                    >
                        Refresh
                    </button>
                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                }
                <ng-content />
            </div>
        </div>
    `
})
export class DemoMenuPopup {
    readonly side = input<'bottom' | 'right'>('bottom');
    readonly showRefresh = input(false);
    readonly refresh = output<void>();
}

@Component({
    selector: 'rdx-menu-composition',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DemoMenu,
        DemoMenuTrigger,
        DemoMenuItem,
        DemoMenuSubTrigger,
        DemoMenuPopup,
        LucideChevronDown,
        LucideChevronRight
    ],
    template: `
        <div class="grid justify-items-center gap-4">
            <demo-menu>
                <button class="demo-button demo-button-outline h-9 px-4" demoMenuTrigger>
                    Menu actions
                    <svg class="size-4" lucideChevronDown></svg>
                </button>
                <demo-menu-popup [showRefresh]="true" (refresh)="selected.set('Refresh')">
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        (onSelect)="selected.set('Rename')"
                        demoMenuItem
                    >
                        Rename
                    </button>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        [disabled]="true"
                        demoMenuItem
                    >
                        Unavailable
                    </button>
                    <demo-menu>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            demoMenuSubTrigger
                        >
                            More options
                            <svg class="size-4" lucideChevronRight></svg>
                        </button>
                        <demo-menu-popup side="right">
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="selected.set('Export file')"
                                demoMenuItem
                            >
                                Export file
                            </button>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="selected.set('Duplicate')"
                                demoMenuItem
                            >
                                Duplicate
                            </button>
                        </demo-menu-popup>
                    </demo-menu>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        (onSelect)="selected.set('Remove')"
                        demoMenuItem
                    >
                        Remove
                    </button>
                </demo-menu-popup>
            </demo-menu>
            <output class="text-muted-foreground text-sm">Last action: {{ selected() }}</output>
        </div>
    `
})
export class RdxMenuCompositionComponent {
    readonly selected = signal('None');
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
