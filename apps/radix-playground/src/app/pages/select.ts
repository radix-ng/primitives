import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { _importsSelect } from '@radix-ng/primitives/select';
import { DemoPage } from '../shared/demo-page';

@Component({
    selector: 'app-select',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DemoPage, ..._importsSelect, LucideChevronDown, LucideCheck],
    template: `
        <demo-page
            title="Select"
            description="Displays a list of options for the user to pick from—triggered by a button."
        >
            <ng-container rdxSelectRoot>
                <button
                    class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background data-[placeholder]:text-muted-foreground inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    aria-label="Pick a fruit"
                    rdxSelectTrigger
                >
                    <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                        {{ selectedValue.slotText() }}
                    </span>
                    <svg lucideChevronDown size="16"></svg>
                </button>

                <div class="z-[100]" *rdxSelectPortal sideOffset="8" rdxSelectPositioner>
                    <div
                        class="border-border bg-popover text-popover-foreground min-w-40 rounded-lg border shadow-md will-change-[opacity,transform]"
                        rdxSelectPopup
                    >
                        <div class="p-1" rdxSelectList>
                            <div rdxSelectGroup>
                                @for (option of options; track option) {
                                    <div
                                        class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-8 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="option"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute left-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                        >
                                            <svg lucideCheck size="16"></svg>
                                        </span>
                                        <span rdxSelectItemText>{{ option }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </ng-container>
        </demo-page>
    `
})
export default class SelectPage {
    protected readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
}
