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
