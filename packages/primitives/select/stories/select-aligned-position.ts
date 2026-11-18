import { booleanAttribute, ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxSelectArrow,
    RdxSelectGroup,
    RdxSelectGroupLabel,
    RdxSelectItem,
    RdxSelectItemAlignedPosition,
    RdxSelectItemAlignedPositionContent,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-aligned-position',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectList,
        LucideChevronDown,
        LucideCheck,
        RdxSelectItem,
        RdxSelectGroupLabel,
        RdxSelectGroup,
        RdxSelectPopup,
        RdxSelectArrow,
        RdxSelectItemAlignedPosition,
        RdxSelectItemText,
        RdxSelectItemAlignedPositionContent,
        RdxSelectItemIndicator
    ],
    template: `
        <ng-container [value]="fruit()" [modal]="modal()" rdxSelectRoot>
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

            <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                <div class="z-[100]" rdxSelectItemAlignedPosition>
                    <div class="min-w-40" rdxSelectPopup>
                        <div
                            class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                            rdxSelectItemAlignedPositionContent
                        >
                            <div class="text-popover demo-arrow my-px" rdxSelectArrow></div>
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
                        </div>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class SelectAlignedPosition {
    /** Whether the select is modal. Exposed so a story can demonstrate the non-modal item-aligned lock. */
    readonly modal = input(true, { transform: booleanAttribute });

    readonly keepMounted = input(false, { transform: booleanAttribute });

    readonly fruit = signal('Apple');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'];
}
