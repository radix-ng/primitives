# Menu — Native elements

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Buttons, links and custom item hosts share the normal `(click)` path for pointer and keyboard
activation. Native button/link Enter stays with the browser. Button items default to `type="button"`
when no type was specified; an explicit `type="submit"` or `type="reset"` keeps its native meaning. Composite Space and custom hosts use
one modifier-preserving click; button keyup does not activate a second time. Links retain navigation
and Ctrl/Meta/Shift/Alt. Space continues an active typeahead query instead of selecting an item.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-native-elements',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex flex-col items-center gap-4">
            <ng-container rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Actions</button>
                <div *rdxMenuPortal [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" (click)="selected.set('Button command')" rdxMenuItem>
                            Button command
                        </button>
                        <!-- RdxMenuItem supplies role, roving tabindex and keyboard activation. -->
                        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
                        <div [class]="m.item" (click)="selected.set('Custom command')" rdxMenuItem>Custom command</div>
                        <a
                            [class]="m.item"
                            (click)="selected.set('Open section')"
                            href="#menu-native-target"
                            rdxMenuLinkItem
                        >
                            Open section
                        </a>
                    </div>
                </div>
            </ng-container>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
            <p class="text-muted-foreground text-sm" id="menu-native-target">Link destination</p>
        </div>
    `
})
export class RdxMenuNativeElementsComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
    protected readonly selected = signal('none');
}
```
