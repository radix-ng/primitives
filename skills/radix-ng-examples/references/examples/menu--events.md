# Menu — Events

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Opening through `defaultOpen` or an external `open` binding without a native opening request focuses
Popup. Native keyboard requests select first/last items; a canceled keyboard request retains that
focus policy if the application subsequently opens the menu externally.

`onOpenChange` carries a cancelable request and its original native event. Canceling Escape keeps
focus on the current item. UI selection reports `item-press`; arrow-driven opening/back navigation
reports `list-navigation`. Checkbox and radio UI value requests also report `item-press` and can
be canceled; programmatic radio selection without an event retains `none`.

Trigger, SubTrigger and Popup accept native `id` bindings with generated defaults. Their
`aria-controls` / `aria-labelledby` links update together. Angular can update those bindings while
the same popup remains open. Tab and Shift+Tab follow the portal's native tab order.

**Migration:** update consumers that previously treated UI selection/navigation as reason `none`.
Item callbacks preserve the actual activation click; nested selection close callbacks run
from ancestors to descendants. A programmatic focus-out still closes Angular Menu; the pinned
React portal's suppression of that event is a documented compatibility difference.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuOpenChange,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-events',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPortal, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    template: `
        <section class="grid w-80 gap-4">
            <label class="flex items-center gap-2 text-sm">
                <input
                    [checked]="cancelNext()"
                    (change)="cancelNext.set($any($event.target).checked)"
                    type="checkbox"
                />
                Cancel next close
            </label>
            <ng-container (onOpenChange)="change($event)" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" [id]="triggerId()" rdxMenuTrigger>
                    Menu events
                </button>
                <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                    <div
                        class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                        [id]="popupId()"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            (onSelect)="selected.set('Run action')"
                            rdxMenuItem
                        >
                            Run action
                        </button>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            [closeOnClick]="false"
                            (onSelect)="rename()"
                            rdxMenuItem
                        >
                            Rename parts
                        </button>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuItem
                        >
                            Close menu
                        </button>
                    </div>
                </div>
            </ng-container>
            <p class="text-muted-foreground text-sm">
                Cancel one close, or rename the trigger and popup while the menu stays open. Their ARIA links update
                together.
            </p>
            <output class="text-muted-foreground text-sm" aria-live="polite">Last change: {{ lastChange() }}</output>
            <p class="text-muted-foreground text-sm">Selected: {{ selected() || 'none' }}</p>
        </section>
    `
})
export class RdxMenuEventsComponent {
    protected readonly triggerId = signal('menu-events-trigger');
    protected readonly popupId = signal('menu-events-popup');
    protected readonly cancelNext = signal(false);
    protected readonly lastChange = signal('none');
    protected readonly selected = signal('');
    protected rename() {
        this.triggerId.set('menu-events-trigger-updated');
        this.popupId.set('menu-events-popup-updated');
    }
    protected change(change: RdxMenuOpenChange) {
        if (!change.open && this.cancelNext()) {
            change.eventDetails.cancel();
            this.cancelNext.set(false);
        }
        this.lastChange.set(`${change.reason}${change.eventDetails.isCanceled() ? ' (canceled)' : ''}`);
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
