import { Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { RdxSelectContent } from '../src/select-content';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemAlignedPosition } from '../src/select-item-aligned-position';
import { RdxSelectItemAlignedPositionContent } from '../src/select-item-aligned-position-content';
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
        LucideAngularModule,
        RdxSelectItem,
        RdxSelectLabel,
        RdxSelectGroup,
        RdxSelectContent,
        RdxSelectPopperPositionWrapper,
        RdxSelectPopperPositionContent,
        RdxSelectItemText,
        RdxSelectItemIndicator
    ],
    template: `
        <ng-container rdxSelectRoot>
            <button
                class="text-grass11 data-[placeholder]:text-green9 inline-flex h-[35px] min-w-[160px] items-center justify-between gap-[5px] rounded-lg border bg-white px-[15px] text-xs leading-none shadow-sm outline-none hover:bg-stone-50 focus:shadow-[0_0_0_2px] focus:shadow-black"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <lucide-angular name="chevron-down" size="16" />
            </button>

            <div [container]="portalContent" rdxSelectPortal>
                <ng-template #portalContent rdxSelectPortalPresence>
                    <div rdxSelectContent>
                        <div
                            class="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-[100] min-w-[160px] rounded-lg border bg-white shadow-sm will-change-[opacity,transform]"
                            [sideOffset]="5"
                            align="start"
                            rdxSelectPopperPositionWrapper
                        >
                            <div rdxSelectPopperPositionContent>
                                <div class="p-[5px]" rdxSelectViewport>
                                    <div class="px-[25px] text-xs leading-[25px] text-gray-600" rdxSelectLabel>
                                        Fruits
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (option of options; track $index) {
                                            <div
                                                class="text-grass11 data-[disabled]:text-mauve8 data-[highlighted]:bg-green9 data-[highlighted]:text-green1 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[35px] text-xs leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none"
                                                [value]="option"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute left-0 inline-flex w-[25px] items-center justify-center"
                                                    rdxSelectItemIndicator
                                                >
                                                    <lucide-angular name="check" size="16" />
                                                </span>
                                                <span rdxSelectItemText>
                                                    {{ option }}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                    <div class="bg-green m-[5px] h-[1px]"></div>
                                    <div class="px-[25px] text-xs leading-[25px] text-gray-600" rdxSelectLabel>
                                        Vegetables
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (vegetable of vegetables; track $index) {
                                            <div
                                                class="text-grass11 data-[disabled]:text-mauve8 data-[highlighted]:bg-green9 data-[highlighted]:text-green1 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[35px] text-xs leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none"
                                                [value]="vegetable"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute left-0 inline-flex w-[25px] items-center justify-center"
                                                    rdxSelectItemIndicator
                                                >
                                                    <lucide-angular name="check" size="16" />
                                                </span>
                                                <span rdxSelectItemText>
                                                    {{ vegetable }}
                                                </span>
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
    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'];
}

@Component({
    selector: 'select-aligned-position',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortalPresence,
        RdxSelectViewport,
        LucideAngularModule,
        RdxSelectItem,
        RdxSelectLabel,
        RdxSelectGroup,
        RdxSelectContent,
        RdxSelectItemAlignedPosition,
        RdxSelectItemText,
        RdxSelectItemAlignedPositionContent
    ],
    template: `
        <ng-container [value]="fruit()" rdxSelectRoot>
            <button
                class="text-violet11 hover:bg-mauve3 data-[placeholder]:text-violet9 inline-flex h-[35px] min-w-[160px] items-center justify-between gap-[5px] rounded bg-white px-[15px] text-[13px] leading-none shadow-[0_2px_10px] shadow-black/10 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <lucide-angular name="chevron-down" size="16" />
            </button>

            <div [container]="portalContent" rdxSelectPortal>
                <ng-template #portalContent rdxSelectPortalPresence>
                    <div class="min-w-[160px]" rdxSelectContent>
                        <div rdxSelectItemAlignedPosition>
                            <div
                                class="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-[100] min-w-[160px] rounded-lg border bg-white shadow-sm will-change-[opacity,transform]"
                                rdxSelectItemAlignedPositionContent
                            >
                                <div class="p-[5px]" rdxSelectViewport>
                                    <div class="px-[25px] text-xs leading-[25px] text-gray-600" rdxSelectLabel>
                                        Fruits
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (option of options; track $index) {
                                            <div
                                                class="text-grass11 data-[disabled]:text-mauve8 data-[highlighted]:bg-green9 data-[highlighted]:text-green1 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[35px] text-xs leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none"
                                                [value]="option"
                                                rdxSelectItem
                                            >
                                                <div rdxSelectItemText>{{ option }}</div>
                                            </div>
                                        }
                                    </div>
                                    <div class="bg-green m-[5px] h-[1px]"></div>
                                    <div class="px-[25px] text-xs leading-[25px] text-gray-600" rdxSelectLabel>
                                        Vegetables
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (vegetable of vegetables; track $index) {
                                            <div
                                                class="text-grass11 data-[disabled]:text-mauve8 data-[highlighted]:bg-green9 data-[highlighted]:text-green1 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[35px] text-xs leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none"
                                                [value]="vegetable"
                                                rdxSelectItem
                                            >
                                                <div rdxSelectItemText>
                                                    {{ vegetable }}
                                                </div>
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
export class SelectAlignedPosition {
    readonly fruit = signal('Apple');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'];
}
