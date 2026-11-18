import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxContextMenuRoot, RdxContextMenuTrigger } from '@radix-ng/primitives/context-menu';
import {
    RdxMenuGroupLabel,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRadioGroup,
    RdxMenuRadioItem,
    RdxMenuRadioItemIndicator,
    RdxMenuSeparator
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-context-menu-radio',
    imports: [
        RdxContextMenuRoot,
        RdxContextMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuGroupLabel,
        RdxMenuSeparator,
        RdxMenuRadioGroup,
        RdxMenuRadioItem,
        RdxMenuRadioItemIndicator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid max-w-full gap-4">
            <ng-container rdxContextMenuRoot>
                <div
                    class="demo-menu-context-area data-[popup-open]:bg-muted flex h-[150px] w-[300px] max-w-full flex-col items-center justify-center gap-1 p-4 data-[popup-open]:border-solid"
                    tabindex="0"
                    rdxContextMenuTrigger
                >
                    <span class="pointer-coarse:hidden">Right-click to choose</span>
                    <span class="hidden pointer-coarse:inline">Long-press to choose</span>
                    <span class="text-foreground font-medium">Person and theme</span>
                </div>
                <ng-template rdxMenuPortal>
                    <div
                        class="z-50 data-[closed]:pointer-events-none"
                        side="right"
                        align="start"
                        sideOffset="4"
                        rdxMenuPositioner
                    >
                        <div
                            class="demo-menu-popup min-w-56! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <div [(value)]="person" rdxMenuRadioGroup>
                                <div class="demo-menu-group-label px-2 py-1.5 ps-8" rdxMenuGroupLabel>People</div>
                                @for (option of people; track option.value) {
                                    <button
                                        class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                        [value]="option.value"
                                        type="button"
                                        rdxMenuRadioItem
                                    >
                                        <span
                                            class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                                            aria-hidden="true"
                                            rdxMenuRadioItemIndicator
                                        >
                                            <span class="size-2 shrink-0 rounded-full bg-current"></span>
                                        </span>
                                        {{ option.label }}
                                    </button>
                                }
                            </div>
                            <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                            <div [(value)]="theme" rdxMenuRadioGroup>
                                <div class="demo-menu-group-label px-2 py-1.5 ps-8" rdxMenuGroupLabel>Theme</div>
                                @for (option of themes; track option.value) {
                                    <button
                                        class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                        [value]="option.value"
                                        type="button"
                                        rdxMenuRadioItem
                                    >
                                        <span
                                            class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                                            aria-hidden="true"
                                            rdxMenuRadioItemIndicator
                                        >
                                            <span class="size-2 shrink-0 rounded-full bg-current"></span>
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
}
