import { Component, input, signal } from '@angular/core';
import { Align } from '@radix-ng/primitives/popper';
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
import { RdxSelectScrollDownButton } from '../src/select-scroll-down-button';
import { RdxSelectScrollUpButton } from '../src/select-scroll-up-button';
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
                class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <lucide-angular name="chevron-down" size="16" />
            </button>

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div rdxSelectContent>
                        <div
                            class="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade border-border bg-popover text-popover-foreground z-[100] min-w-40 rounded-lg border shadow-md will-change-[opacity,transform]"
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
                                        @for (option of options; track $index) {
                                            <div
                                                class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 select-none items-center rounded-sm pl-6 pr-8 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                [value]="option"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute left-0 inline-flex w-6 items-center justify-center"
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
                                    <div class="bg-border mx-1 my-1 h-px"></div>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Vegetables
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (vegetable of vegetables; track $index) {
                                            <div
                                                class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 select-none items-center rounded-sm pl-6 pr-8 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                [value]="vegetable"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute left-0 inline-flex w-6 items-center justify-center"
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
    readonly sideOffset = input<number>(5);
    readonly align = input<Align>('start');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'];
}

@Component({
    selector: 'select-default-with-scroll',
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
                <lucide-angular name="chevron-down" size="16" />
            </button>

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div rdxSelectContent>
                        <div
                            class="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade border-border bg-popover text-popover-foreground z-[100] min-w-40 overflow-auto rounded-lg border shadow-md will-change-[opacity,transform]"
                            [sideOffset]="5"
                            align="start"
                            rdxSelectPopperPositionWrapper
                        >
                            <div rdxSelectPopperPositionContent>
                                <div
                                    class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                                    rdxSelectScrollUpButton
                                >
                                    <lucide-angular name="chevron-up" size="16" />
                                </div>
                                <div class="h-[230px] p-1" rdxSelectViewport>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Fruits
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (option of options; track $index) {
                                            <div
                                                class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 select-none items-center rounded-sm pl-6 pr-8 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                [value]="option"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute left-0 inline-flex w-6 items-center justify-center"
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
                                    <div class="bg-border mx-1 my-1 h-px"></div>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Vegetables
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (vegetable of vegetables; track $index) {
                                            <div
                                                class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 select-none items-center rounded-sm pl-6 pr-8 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                [value]="vegetable"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute left-0 inline-flex w-6 items-center justify-center"
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
                                <div
                                    class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                                    rdxSelectScrollDownButton
                                >
                                    <lucide-angular name="chevron-down" size="16" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </ng-container>
    `
})
export class SelectDefaultWithScroll {
    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = [
        'Aubergine',
        'Broccoli',
        'Carrot',
        'Courgette',
        'Leek',
        'Aubergine1',
        'Broccoli1',
        'Carrot1',
        'Courgette1',
        'Leek1'
    ];
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
        RdxSelectItemAlignedPositionContent,
        RdxSelectItemIndicator
    ],
    template: `
        <ng-container [value]="fruit()" rdxSelectRoot>
            <button
                class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <lucide-angular name="chevron-down" size="16" />
            </button>

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div class="min-w-40" rdxSelectContent>
                        <div rdxSelectItemAlignedPosition>
                            <div
                                class="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade border-border bg-popover text-popover-foreground z-[100] min-w-40 rounded-lg border shadow-md will-change-[opacity,transform]"
                                rdxSelectItemAlignedPositionContent
                            >
                                <div class="p-1" rdxSelectViewport>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Fruits
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (option of options; track $index) {
                                            <div
                                                class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 select-none items-center rounded-sm pl-6 pr-8 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                [value]="option"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute left-0 inline-flex w-6 items-center justify-center"
                                                    rdxSelectItemIndicator
                                                >
                                                    <lucide-angular name="check" size="16" />
                                                </span>
                                                <div rdxSelectItemText>{{ option }}</div>
                                            </div>
                                        }
                                    </div>
                                    <div class="bg-border mx-1 my-1 h-px"></div>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Vegetables
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (vegetable of vegetables; track $index) {
                                            <div
                                                class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 select-none items-center rounded-sm pl-6 pr-8 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                [value]="vegetable"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute left-0 inline-flex w-6 items-center justify-center"
                                                    rdxSelectItemIndicator
                                                >
                                                    <lucide-angular name="check" size="16" />
                                                </span>
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

@Component({
    selector: 'select-aligned-position-with-scroll',
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
        RdxSelectItemAlignedPositionContent,
        RdxSelectItemIndicator,
        RdxSelectScrollDownButton,
        RdxSelectScrollUpButton
    ],
    template: `
        <ng-container [value]="fruit()" rdxSelectRoot>
            <button
                class="border-border bg-background text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Customise options"
                rdxSelectTrigger
            >
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <lucide-angular name="chevron-down" size="16" />
            </button>

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div class="min-w-40" rdxSelectContent>
                        <div rdxSelectItemAlignedPosition>
                            <div
                                class="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade border-border bg-popover text-popover-foreground z-[100] min-w-40 overflow-hidden rounded-lg border shadow-md will-change-[opacity,transform]"
                                rdxSelectItemAlignedPositionContent
                            >
                                <div
                                    class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                                    rdxSelectScrollUpButton
                                >
                                    <lucide-angular name="chevron-up" size="16" />
                                </div>
                                <div class="p-1" rdxSelectViewport>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Fruits
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (option of options; track $index) {
                                            <div
                                                class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 select-none items-center rounded-sm pl-6 pr-8 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                [value]="option"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute left-0 inline-flex w-6 items-center justify-center"
                                                    rdxSelectItemIndicator
                                                >
                                                    <lucide-angular name="check" size="16" />
                                                </span>
                                                <div rdxSelectItemText>{{ option }}</div>
                                            </div>
                                        }
                                    </div>
                                    <div class="bg-border mx-1 my-1 h-px"></div>
                                    <div class="text-muted-foreground px-6 text-xs leading-6" rdxSelectLabel>
                                        Vegetables
                                    </div>
                                    <div rdxSelectGroup>
                                        @for (vegetable of vegetables; track $index) {
                                            <div
                                                class="text-popover-foreground data-[disabled]:text-muted-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex h-7 select-none items-center rounded-sm pl-6 pr-8 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                [value]="vegetable"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute left-0 inline-flex w-6 items-center justify-center"
                                                    rdxSelectItemIndicator
                                                >
                                                    <lucide-angular name="check" size="16" />
                                                </span>
                                                <div rdxSelectItemText>
                                                    {{ vegetable }}
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div
                                    class="text-muted-foreground hover:bg-muted bg-popover flex h-7 cursor-default items-center justify-center"
                                    rdxSelectScrollDownButton
                                >
                                    <lucide-angular name="chevron-down" size="16" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </ng-container>
    `
})
export class SelectAlignedPositionWithScroll {
    readonly fruit = signal('Apple');

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];

    // Long enough to overflow the available viewport height, so the item-aligned popup scrolls
    // and the up/down scroll buttons appear (matches base-ui's item-aligned + scroll behaviour).
    readonly vegetables = [
        'Aubergine',
        'Broccoli',
        'Carrot',
        'Courgette',
        'Leek',
        ...Array.from({ length: 25 }, (_, i) => `Vegetable ${i + 1}`)
    ];
}
