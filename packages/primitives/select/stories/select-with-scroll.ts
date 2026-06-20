import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectGroupLabel } from '../src/select-group-label';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectList } from '../src/select-list';
import { RdxSelectPopup } from '../src/select-popup';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPositioner } from '../src/select-positioner';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectScrollDownButton } from '../src/select-scroll-down-button';
import { RdxSelectScrollUpButton } from '../src/select-scroll-up-button';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-with-scroll',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        LucideChevronDown,
        LucideChevronUp,
        LucideCheck,
        RdxSelectItem,
        RdxSelectGroupLabel,
        RdxSelectGroup,
        RdxSelectPositioner,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        RdxSelectScrollUpButton,
        RdxSelectScrollDownButton
    ],
    template: `
        <ng-container rdxSelectRoot>
            <button
                class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <svg lucideChevronDown size="16" />
            </button>

            <div class="z-[100]" *rdxSelectPortal [sideOffset]="5" align="start" rdxSelectPositioner>
                <div
                    class="border-border bg-popover text-popover-foreground max-h-[300px] min-w-40 overflow-hidden rounded-lg border shadow-md will-change-[opacity,transform]"
                    rdxSelectPopup
                >
                    <div
                        class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                        rdxSelectScrollUpButton
                    >
                        <svg lucideChevronUp size="16" />
                    </div>
                    <div class="p-1" rdxSelectList>
                        <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (option of options; track option) {
                                <div
                                    class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="option"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute left-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg lucideCheck size="16" />
                                    </span>
                                    <span rdxSelectItemText>{{ option }}</span>
                                </div>
                            }
                        </div>
                        <div class="bg-border mx-1 my-1 h-px"></div>
                        <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectGroupLabel>Vegetables</div>
                        <div rdxSelectGroup>
                            @for (vegetable of vegetables; track vegetable) {
                                <div
                                    class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="vegetable"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute left-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg lucideCheck size="16" />
                                    </span>
                                    <span rdxSelectItemText>{{ vegetable }}</span>
                                </div>
                            }
                        </div>
                    </div>
                    <div
                        class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                        rdxSelectScrollDownButton
                    >
                        <svg lucideChevronDown size="16" />
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class SelectWithScroll {
    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = [
        'Aubergine',
        'Broccoli',
        'Carrot',
        'Courgette',
        'Leek',
        'Aubergine 2',
        'Broccoli 2',
        'Carrot 2',
        'Courgette 2',
        'Leek 2'
    ];
}
