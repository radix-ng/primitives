# Navigation Menu — Large menus

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

When the content exceeds the available space, constrain it with a `max-height` and let it scroll. The
viewport measures the capped height, so the popup stays a fixed size and the list scrolls inside it.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

/**
 * Large menus: when the content exceeds the available space, constrain the content with a
 * `max-height` and let it scroll (`overflow-y-auto`). The viewport measures the capped height, so the
 * popup stays a fixed size and the list scrolls inside it.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-large',
    imports: [...navigationMenuImports, LucideChevronDown],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="components">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Components
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div class="w-[340px]">
                            <ul class="grid max-h-[320px] gap-1 overflow-y-auto p-2">
                                @for (item of components; track item.title) {
                                    <li>
                                        <a [class]="cn(m.cardLink, 'p-2.5')" rdxNavigationMenuLink href="#">
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.text }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>
            </ul>

            <div *rdxNavigationMenuPortal [class]="m.positioner" sideOffset="8" rdxNavigationMenuPositioner>
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuLargeComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly components = [
        { title: 'Accordion', text: 'Vertically stacked, collapsible panels.' },
        { title: 'Alert Dialog', text: 'A modal dialog that interrupts the user.' },
        { title: 'Avatar', text: 'An image element with a text fallback.' },
        { title: 'Checkbox', text: 'A control that toggles between states.' },
        { title: 'Collapsible', text: 'Expand and collapse a content region.' },
        { title: 'Dialog', text: 'A window overlaid on the primary window.' },
        { title: 'Dropdown Menu', text: 'A menu of actions triggered by a button.' },
        { title: 'Popover', text: 'Rich content floating around a trigger.' },
        { title: 'Progress', text: 'Displays task completion progress.' },
        { title: 'Radio Group', text: 'A set of mutually exclusive options.' },
        { title: 'Select', text: 'A control for choosing from a list.' },
        { title: 'Slider', text: 'Pick a value from a given range.' },
        { title: 'Switch', text: 'A toggle between on and off.' },
        { title: 'Tabs', text: 'Layered sections of content.' },
        { title: 'Tooltip', text: 'A hint that appears on hover or focus.' }
    ];
}
```
