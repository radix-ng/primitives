import { Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { Direction } from '@radix-ng/primitives/core';
import { Align, SideOrLogical } from '@radix-ng/primitives/popper';
import {
    RdxSelectArrow,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

@Component({
    selector: 'select-arrow-example',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectArrow,
        RdxSelectList,
        RdxSelectItemIndicator,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectPositioner,
        LucideCheck,
        LucideChevronDown
    ],
    template: `
        <ng-container [dir]="dir()" defaultValue="Apple" rdxSelectRoot>
            <button
                class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-64 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                aria-label="Fruit"
                rdxSelectTrigger
            >
                <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
            </button>
            <div
                class="z-[100]"
                *rdxSelectPortal
                [side]="side()"
                [align]="align()"
                [alignOffset]="alignOffset()"
                [dir]="dir()"
                sideOffset="6"
                arrowPadding="8"
                rdxSelectPositioner
            >
                <div
                    class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                    rdxSelectPopup
                >
                    <div class="text-popover demo-arrow my-px" width="12" height="6" rdxSelectArrow></div>
                    <div class="p-1" rdxSelectList>
                        @for (fruit of fruits; track fruit) {
                            <div
                                class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                [value]="fruit"
                                rdxSelectItem
                            >
                                <span
                                    class="absolute start-0 inline-flex w-6 items-center justify-center"
                                    rdxSelectItemIndicator
                                >
                                    <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                                </span>
                                <span rdxSelectItemText>{{ fruit }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class SelectArrowExample {
    readonly side = input<SideOrLogical>('bottom');
    readonly align = input<Align>('center');
    readonly alignOffset = input(0);
    readonly dir = input<Direction>('ltr');
    readonly fruits = ['Apple', 'Banana', 'Blueberry'];
}
