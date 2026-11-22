# Menu — Async items

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Application data can arrive after a menu opens. Keep loading feedback outside the menu item collection;
the popup stays keyboard-ready while it is empty. ArrowDown enters the first available item when focus
is on the popup, even if an earlier empty-list request already highlighted index zero.

These examples use Angular `resource()` with the owning Root's actual `open` signal. Closing cancels
the request; late data does not reopen a menu or steal focus. Both portals use `keepMounted`.

```typescript
import { ChangeDetectionStrategy, Component, input, resource, signal, viewChild } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSubTrigger,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-async',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        LucideChevronRight
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid gap-4">
            <ng-container #root="rdxMenuRoot" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>
                    {{ nested() ? 'Documents' : 'Recent documents' }}
                </button>
                <ng-template [keepMounted]="true" rdxMenuPortal>
                    <div class="z-50 data-[closed]:pointer-events-none" align="start" sideOffset="4" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            @if (nested()) {
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    (onSelect)="selected.set('New document')"
                                    rdxMenuItem
                                >
                                    New document
                                </button>
                                <ng-container #recent="rdxMenuRoot" rdxMenuRoot>
                                    <button
                                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                        rdxMenuSubTrigger
                                    >
                                        Recent documents
                                        <svg class="size-4 shrink-0" lucideChevronRight></svg>
                                    </button>
                                    <ng-template [keepMounted]="true" rdxMenuPortal>
                                        <div
                                            class="z-50 data-[closed]:pointer-events-none"
                                            side="right"
                                            align="start"
                                            sideOffset="4"
                                            rdxMenuPositioner
                                        >
                                            <div
                                                class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                                rdxMenuPopup
                                            >
                                                @if (documents.isLoading()) {
                                                    <p class="text-muted-foreground px-3 py-2 text-sm" role="status">
                                                        Loading documents…
                                                    </p>
                                                }
                                                @for (document of documents.value() ?? []; track document) {
                                                    <button
                                                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                        (onSelect)="selected.set(document)"
                                                        rdxMenuItem
                                                    >
                                                        {{ document }}
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    </ng-template>
                                </ng-container>
                            } @else {
                                @if (documents.isLoading()) {
                                    <p class="text-muted-foreground px-3 py-2 text-sm" role="status">
                                        Loading documents…
                                    </p>
                                }
                                @for (document of documents.value() ?? []; track document) {
                                    <button
                                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                        (onSelect)="selected.set(document)"
                                        rdxMenuItem
                                    >
                                        {{ document }}
                                    </button>
                                }
                            }
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground max-w-72 text-sm">After loading, use the arrow keys to enter the list.</p>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxMenuAsyncComponent {
    readonly nested = input(false);
    private readonly root = viewChild<RdxMenuRoot>('root');
    private readonly recent = viewChild<RdxMenuRoot>('recent');
    protected readonly documents = resource({
        params: () => ((this.nested() ? this.recent()?.open() : this.root()?.open()) ? true : undefined),
        loader: async ({ abortSignal }) => {
            // Simulate an abortable request. An application can use fetch(..., { signal: abortSignal }).
            await new Promise<void>((resolve) => {
                const finish = () => {
                    clearTimeout(timer);
                    abortSignal.removeEventListener('abort', finish);
                    resolve();
                };
                const timer = setTimeout(finish, 600);
                abortSignal.addEventListener('abort', finish, { once: true });
                if (abortSignal.aborted) finish();
            });
            return ['Project notes', 'Release checklist', 'Design review'];
        }
    });
    protected readonly selected = signal('none');
}
```

An empty submenu keeps focus on its trigger. When its items arrive, press the forward arrow again
(`ArrowRight` in LTR, `ArrowLeft` in RTL) to enter. Enter also promotes a hover-opened submenu through
the normal cancelable `trigger-press` request. Selecting an item closes the chain and returns focus to
the surviving top-level trigger, including retained menus.

```typescript
import { ChangeDetectionStrategy, Component, input, resource, signal, viewChild } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSubTrigger,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-async',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        LucideChevronRight
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid gap-4">
            <ng-container #root="rdxMenuRoot" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>
                    {{ nested() ? 'Documents' : 'Recent documents' }}
                </button>
                <ng-template [keepMounted]="true" rdxMenuPortal>
                    <div class="z-50 data-[closed]:pointer-events-none" align="start" sideOffset="4" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            @if (nested()) {
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    (onSelect)="selected.set('New document')"
                                    rdxMenuItem
                                >
                                    New document
                                </button>
                                <ng-container #recent="rdxMenuRoot" rdxMenuRoot>
                                    <button
                                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                        rdxMenuSubTrigger
                                    >
                                        Recent documents
                                        <svg class="size-4 shrink-0" lucideChevronRight></svg>
                                    </button>
                                    <ng-template [keepMounted]="true" rdxMenuPortal>
                                        <div
                                            class="z-50 data-[closed]:pointer-events-none"
                                            side="right"
                                            align="start"
                                            sideOffset="4"
                                            rdxMenuPositioner
                                        >
                                            <div
                                                class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                                rdxMenuPopup
                                            >
                                                @if (documents.isLoading()) {
                                                    <p class="text-muted-foreground px-3 py-2 text-sm" role="status">
                                                        Loading documents…
                                                    </p>
                                                }
                                                @for (document of documents.value() ?? []; track document) {
                                                    <button
                                                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                        (onSelect)="selected.set(document)"
                                                        rdxMenuItem
                                                    >
                                                        {{ document }}
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    </ng-template>
                                </ng-container>
                            } @else {
                                @if (documents.isLoading()) {
                                    <p class="text-muted-foreground px-3 py-2 text-sm" role="status">
                                        Loading documents…
                                    </p>
                                }
                                @for (document of documents.value() ?? []; track document) {
                                    <button
                                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                        (onSelect)="selected.set(document)"
                                        rdxMenuItem
                                    >
                                        {{ document }}
                                    </button>
                                }
                            }
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground max-w-72 text-sm">After loading, use the arrow keys to enter the list.</p>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxMenuAsyncComponent {
    readonly nested = input(false);
    private readonly root = viewChild<RdxMenuRoot>('root');
    private readonly recent = viewChild<RdxMenuRoot>('recent');
    protected readonly documents = resource({
        params: () => ((this.nested() ? this.recent()?.open() : this.root()?.open()) ? true : undefined),
        loader: async ({ abortSignal }) => {
            // Simulate an abortable request. An application can use fetch(..., { signal: abortSignal }).
            await new Promise<void>((resolve) => {
                const finish = () => {
                    clearTimeout(timer);
                    abortSignal.removeEventListener('abort', finish);
                    resolve();
                };
                const timer = setTimeout(finish, 600);
                abortSignal.addEventListener('abort', finish, { once: true });
                if (abortSignal.aborted) finish();
            });
            return ['Project notes', 'Release checklist', 'Design review'];
        }
    });
    protected readonly selected = signal('none');
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
