import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-context-menu-radio',
    imports: [RdxContextMenuModule, RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid max-w-full gap-4">
            <ng-container rdxContextMenuRoot>
                <div
                    [class]="cn(m.contextArea, 'h-[150px] w-[300px] max-w-full flex-col gap-1')"
                    tabindex="0"
                    rdxContextMenuTrigger
                >
                    <span class="pointer-coarse:hidden">Right-click to choose</span>
                    <span class="hidden pointer-coarse:inline">Long-press to choose</span>
                    <span class="text-foreground font-medium">Person and theme</span>
                </div>
                <ng-template rdxMenuPortal>
                    <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                        <div [class]="cn(m.popup, 'min-w-56!')" rdxMenuPopup>
                            <div [(value)]="person" rdxMenuRadioGroup>
                                <div [class]="cn(m.groupLabel, 'ps-8')" rdxMenuGroupLabel>People</div>
                                @for (option of people; track option.value) {
                                    <button
                                        [class]="m.selectableItem"
                                        [value]="option.value"
                                        type="button"
                                        rdxMenuRadioItem
                                    >
                                        <span [class]="m.itemIndicator" aria-hidden="true" rdxMenuRadioItemIndicator>
                                            <span [class]="m.radioIndicator"></span>
                                        </span>
                                        {{ option.label }}
                                    </button>
                                }
                            </div>
                            <div [class]="m.separator" rdxMenuSeparator></div>
                            <div [(value)]="theme" rdxMenuRadioGroup>
                                <div [class]="cn(m.groupLabel, 'ps-8')" rdxMenuGroupLabel>Theme</div>
                                @for (option of themes; track option.value) {
                                    <button
                                        [class]="m.selectableItem"
                                        [value]="option.value"
                                        type="button"
                                        rdxMenuRadioItem
                                    >
                                        <span [class]="m.itemIndicator" aria-hidden="true" rdxMenuRadioItemIndicator>
                                            <span [class]="m.radioIndicator"></span>
                                        </span>
                                        {{ option.label }}
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <output class="text-muted-foreground text-sm" aria-live="polite">
                Selected: {{ person() }} / {{ theme() }}
            </output>
        </div>
    `
})
export class RdxContextMenuRadioComponent {
    protected readonly person = signal<string | undefined>('pedro');
    protected readonly theme = signal<string | undefined>('light');
    protected readonly people = [
        { value: 'pedro', label: 'Pedro Duarte' },
        { value: 'colm', label: 'Colm Tuite' }
    ];
    protected readonly themes = [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' }
    ];
    protected readonly cn = cn;
    protected readonly m = demoMenu;
}
