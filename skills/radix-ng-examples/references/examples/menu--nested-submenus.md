# Menu — Nested submenus

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

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
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-nested',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Edit</button>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        Undo
                    </button>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        Redo
                    </button>
                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>

                    <!-- Submenu: inner rdxMenuRoot provides submenu context -->
                    <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuSubTrigger
                        >
                            Find
                            <span class="text-muted-foreground text-xs">›</span>
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
                                class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                rdxMenuPopup
                            >
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    Search Web…
                                </button>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    Find…
                                </button>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    Find and Replace…
                                </button>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    Use Selection for Find
                                </button>
                            </div>
                        </div>
                    </ng-container>

                    <!-- Second submenu -->
                    <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuSubTrigger
                        >
                            Spelling and Grammar
                            <span class="text-muted-foreground text-xs">›</span>
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
                                class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                rdxMenuPopup
                            >
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    Show Spelling and Grammar
                                </button>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    Check Document Now
                                </button>
                                <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    Check Spelling While Typing
                                </button>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    [disabled]="true"
                                    rdxMenuItem
                                >
                                    Check Grammar
                                </button>
                            </div>
                        </div>
                    </ng-container>

                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        Cut
                    </button>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        Copy
                    </button>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        Paste
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuNestedComponent {}
```

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

/**
 * RTL nested menu: submenus open to the *left* (`side="left"`), so the safe-polygon geometry must
 * resolve the placed side correctly. Mirrors the LTR nested demo with the direction reversed.
 */
@Component({
    selector: 'rdx-menu-nested-rtl',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div dir="rtl">
            <ng-container #root="rdxMenuRoot" dir="rtl" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>تحرير</button>

                <div
                    class="z-50 data-[closed]:pointer-events-none"
                    *rdxMenuPortal
                    side="bottom"
                    align="end"
                    sideOffset="4"
                    rdxMenuPositioner
                >
                    <div
                        class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuItem
                        >
                            تراجع
                        </button>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuItem
                        >
                            إعادة
                        </button>
                        <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>

                        <!-- Submenu opens to the left in RTL -->
                        <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                rdxMenuSubTrigger
                            >
                                <span class="text-muted-foreground text-xs">‹</span>
                                بحث
                            </button>

                            <div
                                class="z-50 data-[closed]:pointer-events-none"
                                *rdxMenuPortal
                                side="left"
                                align="start"
                                sideOffset="4"
                                rdxMenuPositioner
                            >
                                <div
                                    class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                    rdxMenuPopup
                                >
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        rdxMenuItem
                                    >
                                        بحث في الويب…
                                    </button>
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        rdxMenuItem
                                    >
                                        بحث…
                                    </button>
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        rdxMenuItem
                                    >
                                        بحث واستبدال…
                                    </button>
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        rdxMenuItem
                                    >
                                        استخدام التحديد للبحث
                                    </button>
                                </div>
                            </div>
                        </ng-container>

                        <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                rdxMenuSubTrigger
                            >
                                <span class="text-muted-foreground text-xs">‹</span>
                                التدقيق الإملائي والنحوي
                            </button>

                            <div
                                class="z-50 data-[closed]:pointer-events-none"
                                *rdxMenuPortal
                                side="left"
                                align="start"
                                sideOffset="4"
                                rdxMenuPositioner
                            >
                                <div
                                    class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                    rdxMenuPopup
                                >
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        rdxMenuItem
                                    >
                                        عرض التدقيق الإملائي والنحوي
                                    </button>
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        rdxMenuItem
                                    >
                                        تدقيق المستند الآن
                                    </button>
                                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        rdxMenuItem
                                    >
                                        التدقيق الإملائي أثناء الكتابة
                                    </button>
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        [disabled]="true"
                                        rdxMenuItem
                                    >
                                        التدقيق النحوي
                                    </button>
                                </div>
                            </div>
                        </ng-container>

                        <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuItem
                        >
                            قص
                        </button>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuItem
                        >
                            نسخ
                        </button>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuItem
                        >
                            لصق
                        </button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxMenuNestedRtlComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
