import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

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
                <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">تحرير</button>

                <div *rdxMenuPortal side="bottom" align="end" sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">تراجع</button>
                        <button rdxMenuItem [class]="m.item">إعادة</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>

                        <!-- Submenu opens to the left in RTL -->
                        <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
                            <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                                <span class="text-muted-foreground text-xs">‹</span>
                                بحث
                            </button>

                            <div
                                *rdxMenuPortal
                                side="left"
                                align="start"
                                sideOffset="4"
                                rdxMenuPositioner
                                [class]="m.positioner"
                            >
                                <div rdxMenuPopup [class]="m.popup">
                                    <button rdxMenuItem [class]="m.item">بحث في الويب…</button>
                                    <button rdxMenuItem [class]="m.item">بحث…</button>
                                    <button rdxMenuItem [class]="m.item">بحث واستبدال…</button>
                                    <button rdxMenuItem [class]="m.item">استخدام التحديد للبحث</button>
                                </div>
                            </div>
                        </ng-container>

                        <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
                            <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                                <span class="text-muted-foreground text-xs">‹</span>
                                التدقيق الإملائي والنحوي
                            </button>

                            <div
                                *rdxMenuPortal
                                side="left"
                                align="start"
                                sideOffset="4"
                                rdxMenuPositioner
                                [class]="m.positioner"
                            >
                                <div rdxMenuPopup [class]="m.popup">
                                    <button rdxMenuItem [class]="m.item">عرض التدقيق الإملائي والنحوي</button>
                                    <button rdxMenuItem [class]="m.item">تدقيق المستند الآن</button>
                                    <div rdxMenuSeparator [class]="m.separator"></div>
                                    <button rdxMenuItem [class]="m.item">التدقيق الإملائي أثناء الكتابة</button>
                                    <button rdxMenuItem [class]="m.item" [disabled]="true">التدقيق النحوي</button>
                                </div>
                            </div>
                        </ng-container>

                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">قص</button>
                        <button rdxMenuItem [class]="m.item">نسخ</button>
                        <button rdxMenuItem [class]="m.item">لصق</button>
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
