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
import { RdxMenuItem, RdxMenuModule, RdxMenuRoot, RdxMenuSubTrigger, RdxMenuTrigger } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

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
    imports: [RdxMenuModule],
    template: `
        <div *rdxMenuPortal [class]="m.positioner" [side]="side()" align="start" sideOffset="6" rdxMenuPositioner>
            <div [class]="m.popup" rdxMenuPopup>
                @if (showRefresh()) {
                    <button [class]="m.item" (onSelect)="refresh.emit()" rdxMenuItem>Refresh</button>
                    <div [class]="m.separator" rdxMenuSeparator></div>
                }
                <ng-content />
            </div>
        </div>
    `
})
export class DemoMenuPopup {
    readonly m = demoMenu;
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
                <button [class]="cn(b.base, b.outline, b.size.md)" demoMenuTrigger>
                    Menu actions
                    <svg class="size-4" lucideChevronDown></svg>
                </button>
                <demo-menu-popup [showRefresh]="true" (refresh)="selected.set('Refresh')">
                    <button [class]="m.item" (onSelect)="selected.set('Rename')" demoMenuItem>Rename</button>
                    <button [class]="m.item" [disabled]="true" demoMenuItem>Unavailable</button>
                    <demo-menu>
                        <button [class]="cn(m.item, 'flex items-center justify-between')" demoMenuSubTrigger>
                            More options
                            <svg class="size-4" lucideChevronRight></svg>
                        </button>
                        <demo-menu-popup side="right">
                            <button [class]="m.item" (onSelect)="selected.set('Export file')" demoMenuItem>
                                Export file
                            </button>
                            <button [class]="m.item" (onSelect)="selected.set('Duplicate')" demoMenuItem>
                                Duplicate
                            </button>
                        </demo-menu-popup>
                    </demo-menu>
                    <button [class]="m.item" (onSelect)="selected.set('Remove')" demoMenuItem>Remove</button>
                </demo-menu-popup>
            </demo-menu>
            <output class="text-muted-foreground text-sm">Last action: {{ selected() }}</output>
        </div>
    `
})
export class RdxMenuCompositionComponent {
    readonly cn = cn;
    readonly b = demoButton;
    readonly m = demoMenu;
    readonly selected = signal('None');
}
```
