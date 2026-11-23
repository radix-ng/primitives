# Context Menu — Shared menu across areas

> One example from the [Context Menu](../components/context-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Place several `rdxContextMenuTrigger` areas inside one Root to reuse the same popup at each native
gesture's coordinates. Context areas remain separate from Menu trigger registration and ARIA identity.
Their open/pressed attributes reflect the shared menu state, rather than an active-area payload.

```typescript
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { RdxContextMenuRoot, RdxContextMenuTrigger } from '@radix-ng/primitives/context-menu';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSubTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-context-menu-areas',
    imports: [
        RdxContextMenuRoot,
        RdxContextMenuTrigger,
        RdxMenuRoot,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        LucideChevronRight
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid max-w-full gap-4">
            <ng-container rdxContextMenuRoot>
                @if (nested()) {
                    <div
                        class="demo-menu-context-area data-[popup-open]:bg-muted flex grid min-h-28 min-w-40 items-center justify-center gap-4 p-4 p-6 data-[popup-open]:border-solid"
                        tabindex="0"
                        rdxContextMenuTrigger
                    >
                        Outer area
                        <div
                            class="demo-menu-context-area data-[popup-open]:bg-muted flex min-h-28 min-w-40 items-center justify-center p-4 data-[popup-open]:border-solid"
                            tabindex="0"
                            rdxContextMenuTrigger
                        >
                            Inner area
                        </div>
                    </div>
                } @else {
                    <div class="grid gap-4 sm:grid-cols-2">
                        <div
                            class="demo-menu-context-area data-[popup-open]:bg-muted flex min-h-28 min-w-40 items-center justify-center p-4 data-[popup-open]:border-solid"
                            tabindex="0"
                            rdxContextMenuTrigger
                        >
                            First area
                        </div>
                        <div
                            class="demo-menu-context-area data-[popup-open]:bg-muted flex min-h-28 min-w-40 items-center justify-center p-4 data-[popup-open]:border-solid"
                            tabindex="0"
                            rdxContextMenuTrigger
                        >
                            Second area
                        </div>
                    </div>
                }
                <ng-template rdxMenuPortal>
                    <div
                        class="z-50 data-[closed]:pointer-events-none"
                        side="right"
                        align="start"
                        sideOffset="4"
                        rdxMenuPositioner
                    >
                        <div
                            class="demo-menu-popup min-w-44! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <div
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                (onSelect)="selected.set('Open')"
                                rdxMenuItem
                            >
                                Open
                            </div>
                            <div
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                (onSelect)="selected.set('Duplicate')"
                                rdxMenuItem
                            >
                                Duplicate
                            </div>
                            <ng-container rdxMenuRoot>
                                <div
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground data-[popup-open]:bg-muted relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuSubTrigger
                                >
                                    Share
                                    <svg class="size-4 shrink-0" lucideChevronRight></svg>
                                </div>
                                <ng-template rdxMenuPortal>
                                    <div
                                        class="z-50 data-[closed]:pointer-events-none"
                                        side="right"
                                        align="start"
                                        sideOffset="8"
                                        alignOffset="-4"
                                        rdxMenuPositioner
                                    >
                                        <div
                                            class="demo-menu-popup min-w-40! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                            rdxMenuPopup
                                        >
                                            <div
                                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                                (onSelect)="selected.set('Copy link')"
                                                rdxMenuItem
                                            >
                                                Copy link
                                            </div>
                                            <div
                                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                                (onSelect)="selected.set('Send by email')"
                                                rdxMenuItem
                                            >
                                                Send by email
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground text-sm">Right-click an area to open the shared menu.</p>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxContextMenuAreasComponent {
    readonly nested = input(false);
    protected readonly selected = signal('none');
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
