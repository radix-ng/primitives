# Menu — Animated triggers

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

This example follows Base UI's moving-menu anatomy: detached triggers, one Positioner/Popup, and
a Viewport containing one direct content wrapper. Positioner transitions animate location, Popup
transitions animate width/height, and Viewport's `data-current`/`data-previous` containers animate
the content. `data-activation-direction` is a space-separated horizontal/vertical token list.

Use the positioner's `--positioner-width`/`--positioner-height` and the popup's `--popup-width`/
`--popup-height` variables to stabilize the measured boxes. The outgoing content is an inert,
aria-hidden visual snapshot with duplicate ids removed; the live Angular view keeps its directives
and handlers. Reduced-motion users get immediate transitions. Styling is entirely Tailwind utilities.

```typescript
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { createRdxMenuHandle, RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

interface MenuContent {
    id: string;
    heading: string;
    width: string;
    groups: { id: string; items: string[] }[];
}

const menus: MenuContent[] = [
    {
        id: 'library',
        heading: 'Library',
        width: 'w-52',
        groups: [
            { id: 'library-add', items: ['Add to library', 'Add to favorites'] },
            { id: 'library-create', items: ['Create playlist', 'Create station'] }
        ]
    },
    {
        id: 'playback',
        heading: 'Playback',
        width: 'w-64',
        groups: [
            { id: 'playback-queue', items: ['Play now', 'Add to queue'] },
            { id: 'playback-options', items: ['Play next', 'Play last', 'Sleep timer'] }
        ]
    },
    {
        id: 'share',
        heading: 'Share',
        width: 'w-56',
        groups: [
            { id: 'share-copy', items: ['Copy link', 'Copy embed code'] },
            { id: 'share-send', items: ['Share to contacts', 'Share to social'] }
        ]
    }
];

@Component({
    selector: 'rdx-menu-multiple-triggers',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid justify-items-center gap-4">
            @if (controlled()) {
                <div class="flex flex-wrap justify-center gap-2">
                    <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="openPlayback()">
                        Open playback (controlled)
                    </button>
                    <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(false)">Close menu</button>
                </div>
            }
            <div class="flex flex-wrap items-center justify-center gap-2">
                @for (menu of menus; track menu.id) {
                    <button
                        [class]="cn(b.base, b.outline, b.size.md, 'data-[popup-open]:bg-muted')"
                        [id]="prefix + menu.id"
                        [handle]="handle"
                        [payload]="menu"
                        rdxMenuTrigger
                    >
                        {{ menu.heading }}
                    </button>
                }
            </div>
            <ng-container
                #root="rdxMenuRoot"
                [(open)]="open"
                [(triggerId)]="triggerId"
                [handle]="handle"
                [modal]="false"
                rdxMenuRoot
            >
                <div
                    *rdxMenuPortal
                    [class]="cn(m.positioner, animated() ? positionerAnimation : '')"
                    sideOffset="8"
                    align="start"
                    rdxMenuPositioner
                >
                    <div [class]="cn(m.popup, 'p-0!', animated() ? popupAnimation : '')" rdxMenuPopup>
                        <div [class]="cn('relative', animated() ? viewportAnimation : '')" rdxMenuViewport>
                            <div [class]="cn(root.payload()?.width, 'p-1')">
                                @for (group of root.payload()?.groups; track group.id) {
                                    <div rdxMenuGroup>
                                        @if ($first) {
                                            <div [class]="m.groupLabel" rdxMenuGroupLabel>
                                                {{ root.payload()?.heading }}
                                            </div>
                                        }
                                        @for (item of group.items; track item) {
                                            <button
                                                [class]="cn(m.item, 'text-start')"
                                                (onSelect)="selected.set(item)"
                                                rdxMenuItem
                                            >
                                                {{ item }}
                                            </button>
                                        }
                                    </div>
                                    @if (!$last) {
                                        <div [class]="m.separator" rdxMenuSeparator></div>
                                    }
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </ng-container>
            <output [class]="cn('text-muted-foreground text-sm', root.present() && 'invisible')">
                Last action: {{ selected() }}
            </output>
        </div>
    `
})
export class RdxMenuMultipleTriggersComponent {
    readonly animated = input(false);
    readonly controlled = input(false);
    readonly handle = createRdxMenuHandle<MenuContent>();
    protected readonly prefix = injectId('menu-demo-');
    readonly open = signal(false);
    readonly triggerId = signal<string | null>(null);
    readonly selected = signal('None');
    readonly menus = menus;
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
    protected readonly positionerAnimation =
        'h-[var(--positioner-height)] w-[var(--positioner-width)] transition-[top,left,right,bottom] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] data-[instant]:transition-none motion-reduce:transition-none';
    protected readonly popupAnimation =
        'relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] origin-[var(--transform-origin)] overflow-hidden transition-[width,height,opacity,scale] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[closed]:block! data-[instant]:transition-none motion-reduce:transition-none';
    protected readonly viewportAnimation = `overflow-clip
        [&>[data-current]]:translate-x-0 [&>[data-current]]:opacity-100 [&>[data-current]]:transition-[translate,opacity] [&>[data-current]]:duration-350
        [&>[data-previous]]:absolute [&>[data-previous]]:inset-0 [&>[data-previous]]:translate-x-0 [&>[data-previous]]:opacity-100 [&>[data-previous]]:transition-[translate,opacity] [&>[data-previous]]:duration-350
        data-[activation-direction~=left]:[&>[data-current][data-starting-style]]:-translate-x-1/2
        data-[activation-direction~=right]:[&>[data-current][data-starting-style]]:translate-x-1/2
        [&>[data-current][data-starting-style]]:opacity-0
        data-[activation-direction~=left]:[&>[data-previous][data-ending-style]]:translate-x-1/2
        data-[activation-direction~=right]:[&>[data-previous][data-ending-style]]:-translate-x-1/2
        [&>[data-previous][data-ending-style]]:opacity-0
        motion-reduce:[&>*]:transition-none`;
    openPlayback(): void {
        this.triggerId.set(this.prefix + 'playback');
        this.open.set(true);
    }
}
```
