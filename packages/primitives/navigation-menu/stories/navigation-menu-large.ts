import { cn, demoNavigationMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';

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
        <nav rdxNavigationMenuRoot [class]="m.root">
            <ul rdxNavigationMenuList [class]="m.list">
                <li rdxNavigationMenuItem value="components">
                    <button rdxNavigationMenuTrigger [class]="m.trigger">
                        Components
                        <svg rdxNavigationMenuIcon lucideChevronDown [class]="m.icon"></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div class="w-[340px]">
                            <ul class="grid max-h-[320px] gap-1 overflow-y-auto p-2">
                                @for (item of components; track item.title) {
                                    <li>
                                        <a rdxNavigationMenuLink href="#" [class]="cn(m.cardLink, 'p-2.5')">
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

            <div *rdxNavigationMenuPortal sideOffset="8" rdxNavigationMenuPositioner [class]="m.positioner">
                <div rdxNavigationMenuPopup [class]="m.popup">
                    <div rdxNavigationMenuViewport [class]="m.viewport"></div>
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
