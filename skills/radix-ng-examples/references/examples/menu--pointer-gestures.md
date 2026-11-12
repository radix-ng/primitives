# Menu — Pointer gestures

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Set `openOnHover` on the trigger to open after `delay`; `closeDelay` and the grace area protect
travel into the popup. Hover opening focuses the popup without highlighting a command. Clicking
promotes an open hover menu to `trigger-press`, so moving away keeps it open. A press before the
hover delay also keeps its press lifetime. Hover dismissal reports `trigger-hover` with the native
mouse event; it does not restore focus to the trigger.

Hold the primary mouse button, move onto a command, and release after the 200 ms opening guard to
select it. Disabled commands may receive hover focus but cannot activate. Checkbox/radio and
`closeOnClick=false` items keep their usual stay-open behavior.

Touch taps work with hover opening enabled. Tapping a submenu trigger opens it; tapping it again
closes that child. Disabled items stay available to keyboard navigation and do not take pointer focus.
The trigger's `data-pressed` remains set while its menu is open; use native `:active` for physical
press feedback. Change details preserve the original browser event, so a touch activation may report
its compatibility `mousedown` rather than a PointerEvent.

Submenu hover uses entry delay and pointer-rest intent. A canceled opening can leave the other
intent pending; an accepted opening consumes it.

Submenus protect diagonal travel, including RTL. After entering the submenu, moving outside it
does not dismiss it; hovering another parent item closes that branch.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-pointer',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex max-w-sm flex-col gap-4">
            <p class="text-muted-foreground text-sm">
                Hover to open. Click to keep it open, or hold the mouse button, drag onto a command and release.
            </p>
            <ng-container rdxMenuRoot>
                <button
                    [class]="cn(b.base, b.outline, b.size.md)"
                    [openOnHover]="true"
                    [delay]="180"
                    [closeDelay]="80"
                    rdxMenuTrigger
                >
                    Commands
                </button>
                <div *rdxMenuPortal [class]="m.positioner" sideOffset="8" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" (click)="selected.set('New tab')" rdxMenuItem>New tab</button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>Unavailable</button>
                        <button [class]="m.item" (click)="selected.set('Save page')" rdxMenuItem>Save page</button>
                    </div>
                </div>
            </ng-container>
            <output class="text-muted-foreground text-sm" aria-live="polite">
                {{ selected() || 'No command selected' }}
            </output>
        </div>
    `
})
export class RdxMenuPointerComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
    protected readonly selected = signal('');
}
```
