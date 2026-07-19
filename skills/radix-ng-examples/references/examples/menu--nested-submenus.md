# Menu — Nested submenus

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Wrap a `rdxMenuSubTrigger` and its popup inside a nested `ng-container rdxMenuRoot`. The subtrigger
opens the submenu on hover (100 ms `delay`), click, or ArrowRight; ArrowLeft closes it and returns
focus to the subtrigger.

When opened by hover, the submenu keeps a **safe polygon** between the trigger and the popup: you can
move the pointer diagonally toward the submenu — even across a sibling subtrigger in between — without
it closing or switching. Moving the pointer away from that area closes the submenu (use `closeDelay`
to add a grace period).

![Submenu safe polygon — a triangular safe zone spans from the pointer to the popup, so the pointer can cut diagonally across the sibling row below without closing the submenu.](/menu-safe-polygon.svg)

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-nested',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Edit</button>

            <div *rdxMenuPortal [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                <div [class]="m.popup" rdxMenuPopup>
                    <button [class]="m.item" rdxMenuItem>Undo</button>
                    <button [class]="m.item" rdxMenuItem>Redo</button>
                    <div [class]="m.separator" rdxMenuSeparator></div>

                    <!-- Submenu: inner rdxMenuRoot provides submenu context -->
                    <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
                        <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                            Find
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>

                        <div
                            *rdxMenuPortal
                            [class]="m.positioner"
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                        >
                            <div [class]="m.popup" rdxMenuPopup>
                                <button [class]="m.item" rdxMenuItem>Search Web…</button>
                                <button [class]="m.item" rdxMenuItem>Find…</button>
                                <button [class]="m.item" rdxMenuItem>Find and Replace…</button>
                                <button [class]="m.item" rdxMenuItem>Use Selection for Find</button>
                            </div>
                        </div>
                    </ng-container>

                    <!-- Second submenu -->
                    <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
                        <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                            Spelling and Grammar
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>

                        <div
                            *rdxMenuPortal
                            [class]="m.positioner"
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                        >
                            <div [class]="m.popup" rdxMenuPopup>
                                <button [class]="m.item" rdxMenuItem>Show Spelling and Grammar</button>
                                <button [class]="m.item" rdxMenuItem>Check Document Now</button>
                                <div [class]="m.separator" rdxMenuSeparator></div>
                                <button [class]="m.item" rdxMenuItem>Check Spelling While Typing</button>
                                <button [class]="m.item" [disabled]="true" rdxMenuItem>Check Grammar</button>
                            </div>
                        </div>
                    </ng-container>

                    <div [class]="m.separator" rdxMenuSeparator></div>
                    <button [class]="m.item" rdxMenuItem>Cut</button>
                    <button [class]="m.item" rdxMenuItem>Copy</button>
                    <button [class]="m.item" rdxMenuItem>Paste</button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuNestedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
```

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

/**
 * RTL nested menu: submenus open to the *left* (`side="left"`), so the safe-polygon geometry must
 * resolve the placed side correctly. Mirrors the LTR nested demo with the direction reversed.
 */
@Component({
    selector: 'rdx-menu-nested-rtl',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div dir="rtl">
            <ng-container #root="rdxMenuRoot" dir="rtl" rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>تحرير</button>

                <div *rdxMenuPortal [class]="m.positioner" side="bottom" align="end" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>تراجع</button>
                        <button [class]="m.item" rdxMenuItem>إعادة</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>

                        <!-- Submenu opens to the left in RTL -->
                        <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
                            <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                <span class="text-muted-foreground text-xs">‹</span>
                                بحث
                            </button>

                            <div
                                *rdxMenuPortal
                                [class]="m.positioner"
                                side="left"
                                align="start"
                                sideOffset="4"
                                rdxMenuPositioner
                            >
                                <div [class]="m.popup" rdxMenuPopup>
                                    <button [class]="m.item" rdxMenuItem>بحث في الويب…</button>
                                    <button [class]="m.item" rdxMenuItem>بحث…</button>
                                    <button [class]="m.item" rdxMenuItem>بحث واستبدال…</button>
                                    <button [class]="m.item" rdxMenuItem>استخدام التحديد للبحث</button>
                                </div>
                            </div>
                        </ng-container>

                        <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
                            <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                <span class="text-muted-foreground text-xs">‹</span>
                                التدقيق الإملائي والنحوي
                            </button>

                            <div
                                *rdxMenuPortal
                                [class]="m.positioner"
                                side="left"
                                align="start"
                                sideOffset="4"
                                rdxMenuPositioner
                            >
                                <div [class]="m.popup" rdxMenuPopup>
                                    <button [class]="m.item" rdxMenuItem>عرض التدقيق الإملائي والنحوي</button>
                                    <button [class]="m.item" rdxMenuItem>تدقيق المستند الآن</button>
                                    <div [class]="m.separator" rdxMenuSeparator></div>
                                    <button [class]="m.item" rdxMenuItem>التدقيق الإملائي أثناء الكتابة</button>
                                    <button [class]="m.item" [disabled]="true" rdxMenuItem>التدقيق النحوي</button>
                                </div>
                            </div>
                        </ng-container>

                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>قص</button>
                        <button [class]="m.item" rdxMenuItem>نسخ</button>
                        <button [class]="m.item" rdxMenuItem>لصق</button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxMenuNestedRtlComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
```
