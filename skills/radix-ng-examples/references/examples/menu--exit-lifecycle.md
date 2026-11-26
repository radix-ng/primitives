# Menu — Exit lifecycle

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Call `eventDetails.preventUnmountOnClose()` from `(onOpenChange)` to retain the popup for an external
animation. Finish that accepted close with `root.unmount()`. The popup stays in its ending phase
and blocks pointer interaction until completion. Native keyboard focus is preserved during the exit.
`keepMounted` decides whether the settled, hidden view remains in the DOM; it does not delay completion.

```html
<ng-container #root="rdxMenuRoot" (onOpenChange)="change($event)" rdxMenuRoot>
    <button rdxMenuTrigger>Actions</button>
    <ng-template [keepMounted]="keepMounted" rdxMenuPortal>
        <div rdxMenuPositioner><div rdxMenuPopup>…items…</div></div>
    </ng-template>
</ng-container>
```

```ts
change(change: RdxMenuOpenChange) {
    if (!change.open) {
        change.eventDetails.preventUnmountOnClose();
        // Start an external exit here, then call root.unmount() when it finishes.
    }
}
```

Repeated `unmount()` calls and obsolete hold callbacks have no effect after completion. Calling
`unmount()` while open does not close the menu. A canceled request does not retain a later close.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import {
    RdxMenuCheckboxItem,
    RdxMenuItem,
    RdxMenuOpenChange,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSubTrigger,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-lifecycle',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuCheckboxItem,
        RdxFloatingInsideElement
    ],
    template: `
        <section
            class="grid w-80 max-w-full gap-4"
            #root="rdxMenuRoot"
            (onOpenChange)="change($event)"
            (onOpenChangeComplete)="complete($event)"
            rdxMenuRoot
        >
            <div class="grid gap-2 text-sm" rdxFloatingInside>
                <label class="flex items-center gap-2">
                    <input [checked]="defer()" (change)="defer.set($any($event.target).checked)" type="checkbox" />
                    Defer unmount
                </label>
                <label class="flex items-center gap-2">
                    <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                    Keep mounted
                </label>
                <label class="flex items-center gap-2">
                    <input
                        [checked]="cancelNext()"
                        (change)="cancelNext.set($any($event.target).checked)"
                        type="checkbox"
                    />
                    Cancel next close
                </label>
            </div>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Menu lifecycle</button>
            <ng-template [keepMounted]="keep()" rdxMenuPortal>
                <div class="z-50 data-[closed]:pointer-events-none" sideOffset="4" rdxMenuPositioner>
                    <div
                        class="demo-menu-popup data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out w-64 min-w-[8rem] origin-[var(--transform-origin)] p-1 data-[closed]:pointer-events-none data-[closed]:block! data-[closed]:hidden"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuItem
                        >
                            New tab
                        </button>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            #notifications="rdxMenuCheckboxItem"
                            rdxMenuCheckboxItem
                        >
                            Notifications
                            <span class="text-muted-foreground ml-auto text-xs">
                                {{ notifications.checked() ? 'On' : 'Off' }}
                            </span>
                        </button>
                        <ng-container rdxMenuRoot>
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                rdxMenuSubTrigger
                            >
                                More actions
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
                                    class="demo-menu-popup data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out min-w-[8rem] origin-[var(--transform-origin)] p-1 data-[closed]:pointer-events-none data-[closed]:block! data-[closed]:hidden"
                                    data-testid="lifecycle-submenu"
                                    rdxMenuPopup
                                >
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        rdxMenuItem
                                    >
                                        Archive
                                    </button>
                                </div>
                            </div>
                        </ng-container>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuItem
                        >
                            Close menu
                        </button>
                    </div>
                </div>
            </ng-template>
            <div class="flex gap-2" rdxFloatingInside>
                <button class="demo-button demo-button-outline h-8 px-3 text-xs" (click)="root.close()" type="button">
                    Close
                </button>
                <button class="demo-button demo-button-outline h-8 px-3 text-xs" (click)="root.unmount()" type="button">
                    Finish exit
                </button>
            </div>
            <p class="text-muted-foreground text-sm">
                Keep mounted preserves the checkbox state. Finish exit completes a deferred close.
            </p>
            <output class="text-muted-foreground text-sm" aria-live="polite">
                Completed: {{ completions().join(' → ') || 'none' }}
            </output>
        </section>
    `
})
export class RdxMenuLifecycleComponent {
    protected readonly defer = signal(false);
    protected readonly keep = signal(false);
    protected readonly cancelNext = signal(false);
    protected readonly completions = signal<string[]>([]);
    protected change(change: RdxMenuOpenChange) {
        if (change.open) return;
        if (this.cancelNext()) {
            change.eventDetails.cancel();
            this.cancelNext.set(false);
            return;
        }
        if (this.defer()) change.eventDetails.preventUnmountOnClose();
    }
    protected complete(open: boolean) {
        this.completions.update((values) => [...values, open ? 'open' : 'closed']);
    }
}
```

**Migration:** `root.close()` now reports `imperative-action` by default. Start external animations
from `(onOpenChange)`; a deferred `(onOpenChangeComplete)` waits for `unmount()` instead of firing
while the popup is still retained.

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
