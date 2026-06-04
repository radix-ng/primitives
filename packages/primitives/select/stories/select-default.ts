import { Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { Align } from '@radix-ng/primitives/popper';
import { RdxSelectContent } from '../src/select-content';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectLabel } from '../src/select-label';
import { RdxSelectPopperPositionContent } from '../src/select-popper-position-content';
import { RdxSelectPopperPositionWrapper } from '../src/select-popper-position-wrapper';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPortalPresence } from '../src/select-portal-presence';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';
import { RdxSelectViewport } from '../src/select-viewport';

@Component({
    selector: 'select-default',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortalPresence,
        RdxSelectContent,
        RdxSelectViewport,
        LucideChevronDown,
        LucideCheck,
        RdxSelectItem,
        RdxSelectLabel,
        RdxSelectGroup,
        RdxSelectPopperPositionWrapper,
        RdxSelectPopperPositionContent,
        RdxSelectItemText,
        RdxSelectItemIndicator
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

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div rdxSelectContent>
                        <div
                            class="border-border bg-popover text-popover-foreground z-[100] min-w-40 rounded-lg border shadow-md will-change-[opacity,transform]"
                            [sideOffset]="sideOffset()"
                            [align]="align()"
                            rdxSelectPopperPositionWrapper
                        >
                            <div rdxSelectPopperPositionContent>
                                <div class="p-1" rdxSelectViewport>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Fruits
                                    </div>
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
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Vegetables
                                    </div>
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
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </ng-container>
    `
})
export class SelectDefault {
    readonly sideOffset = input<number>(5);
    readonly align = input<Align>('start');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'];
}
