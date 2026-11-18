import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import {
    RdxSelectGroup,
    RdxSelectGroupLabel,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectScrollDownButton,
    RdxSelectScrollUpButton,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

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
                class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 min-w-40 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
            </button>

            <div class="z-[100]" *rdxSelectPortal [sideOffset]="5" align="start" rdxSelectPositioner>
                <div
                    class="demo-select-popup max-h-[300px] min-w-[var(--anchor-width,10rem)] overflow-hidden will-change-[opacity,transform]"
                    rdxSelectPopup
                >
                    <div class="demo-select-scroll-button flex h-7 items-center justify-center" rdxSelectScrollUpButton>
                        <svg class="size-4 shrink-0" lucideChevronUp size="16" aria-hidden="true" />
                    </div>
                    <div class="p-1" rdxSelectList>
                        <div class="demo-select-group-label px-6" rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (option of options; track option) {
                                <div
                                    class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="option"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute start-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                                    </span>
                                    <span rdxSelectItemText>{{ option }}</span>
                                </div>
                            }
                        </div>
                        <div class="bg-border mx-1 my-1 h-px"></div>
                        <div class="demo-select-group-label px-6" rdxSelectGroupLabel>Vegetables</div>
                        <div rdxSelectGroup>
                            @for (vegetable of vegetables; track vegetable) {
                                <div
                                    class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="vegetable"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute start-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                    >
                                        <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                                    </span>
                                    <span rdxSelectItemText>{{ vegetable }}</span>
                                </div>
                            }
                        </div>
                    </div>
                    <div
                        class="demo-select-scroll-button flex h-7 items-center justify-center"
                        rdxSelectScrollDownButton
                    >
                        <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
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
