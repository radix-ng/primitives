import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'menu-radio-items-story',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>View</button>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Minimize window
                    </button>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Zoom
                    </button>
                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                    <div [(value)]="selectedItem" rdxMenuRadioGroup>
                        @for (item of items(); track item) {
                            <label
                                class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                [value]="item"
                                rdxMenuRadioItem
                            >
                                <span
                                    class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                                    rdxMenuRadioItemIndicator
                                >
                                    ●
                                </span>
                                {{ item }}
                            </label>
                        }
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class MenuRadioItemsStory {
    readonly items = signal(['README.md', 'index.js', 'page.css']);
    selectedItem: string | undefined = undefined;
}
