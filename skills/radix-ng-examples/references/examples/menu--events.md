# Menu — Events

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

`onOpenChange` carries a cancelable request and its original native event. Canceling Escape keeps
focus on the current item. UI selection reports `item-press`; arrow-driven opening/back navigation
reports `list-navigation`. Checkbox and radio UI value requests also report `item-press` and can
be canceled; programmatic radio selection without an event retains `none`.

Trigger, SubTrigger and Popup accept native `id` bindings with generated defaults. Their
`aria-controls` / `aria-labelledby` links update together. Angular can update those bindings while
the same popup remains open. Tab and Shift+Tab follow the portal's native tab order.

**Migration:** update consumers that previously treated UI selection/navigation as reason `none`.
Item callbacks now preserve the actual click/keyboard event; nested selection close callbacks run
from ancestors to descendants. A programmatic focus-out still closes Angular Menu; the pinned
React portal's suppression of that event is a documented compatibility difference.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule, RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-events',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxMenuModule],
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
                <button [id]="triggerId()" [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>
                    Menu events
                </button>
                <div *rdxMenuPortal [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [id]="popupId()" [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" (onSelect)="selected.set('Run action')" rdxMenuItem>Run action</button>
                        <button [class]="m.item" [closeOnClick]="false" (onSelect)="rename()" rdxMenuItem>
                            Rename parts
                        </button>
                        <button [class]="m.item" rdxMenuItem>Close menu</button>
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
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
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
