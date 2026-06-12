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
            <ng-container #root="rdxMenuRoot" rdxMenuRoot>
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
