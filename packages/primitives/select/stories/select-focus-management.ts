import { Component, input, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';
import {
    RdxPopoverClose,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectOpenChangeEvent,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

@Component({
    selector: 'select-focus-controls',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectLabel,
        RdxSelectItemIndicator,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectPositioner,
        LucideCheck,
        LucideChevronDown
    ],
    template: `
        <div class="grid w-64 gap-3">
            <button class="demo-button demo-button-outline h-8 px-3 text-xs" data-testid="before-select" type="button">
                Before select
            </button>
            <ng-container
                [(open)]="open"
                [modal]="false"
                (onOpenChange)="onOpenChange($event)"
                (onOpenChangeComplete)="completed.set($event ? 'Opened' : 'Closed')"
                defaultValue="Apple"
                rdxSelectRoot
            >
                <div class="text-sm font-medium" rdxSelectLabel>Fruit</div>
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                    <div class="z-[100]" sideOffset="5" rdxSelectPositioner>
                        <div
                            class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                            [closeOnFocusOut]="closeOnFocusOut()"
                            [finalFocus]="
                                finalFocus() === 'after' ? after : finalFocus() === 'none' ? false : undefined
                            "
                            rdxSelectPopup
                        >
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
                </ng-template>
            </ng-container>
            <button
                class="demo-button demo-button-outline h-8 px-3 text-xs"
                #after
                data-testid="after-select"
                type="button"
            >
                After select
            </button>
            <output class="text-muted-foreground text-xs" data-testid="focus-state">
                {{ open() ? 'Open' : 'Closed' }}
            </output>
            <output class="text-muted-foreground text-xs" data-testid="focus-reason">{{ reason() }}</output>
            <output class="text-muted-foreground text-xs" data-testid="focus-complete">{{ completed() }}</output>
        </div>
    `
})
export class SelectFocusControls {
    readonly keepMounted = input(true);
    readonly closeOnFocusOut = input(false);
    readonly finalFocus = input<'default' | 'after' | 'none'>('default');
    readonly cancelClose = input(false);
    readonly open = signal(false);
    readonly reason = signal('No request');
    readonly completed = signal('Not opened');
    readonly fruits = ['Apple', 'Banana', 'Blueberry'];

    onOpenChange(change: RdxSelectOpenChangeEvent): void {
        this.reason.set(change.eventDetails.reason);
        if (!change.open && this.cancelClose()) change.eventDetails.cancel();
    }
}

@Component({
    selector: 'select-focus-management',
    imports: [
        SelectFocusControls,
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverClose
    ],
    template: `
        <div class="grid justify-items-start gap-4">
            @switch (shell()) {
                @case ('dialog') {
                    <ng-container rdxDialogRoot>
                        <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDialogTrigger>
                            Open dialog
                        </button>
                        <ng-template rdxDialogPortal>
                            <div class="bg-foreground/50 fixed inset-0 z-50" rdxDialogBackdrop></div>
                            <div
                                class="demo-popup fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                                rdxDialogPopup
                            >
                                <h2 class="demo-dialog-title" rdxDialogTitle>Choose a fruit</h2>
                                <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                                    Use the Select, then continue below.
                                </p>
                                <select-focus-controls
                                    [keepMounted]="keepMounted()"
                                    [closeOnFocusOut]="closeOnFocusOut()"
                                    [finalFocus]="finalFocus()"
                                    [cancelClose]="cancelClose()"
                                />
                                <button class="demo-button demo-button-outline mt-4 h-8 px-3 text-xs" rdxDialogClose>
                                    Close dialog
                                </button>
                            </div>
                        </ng-template>
                    </ng-container>
                }
                @case ('popover') {
                    <ng-container rdxPopoverRoot>
                        <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxPopoverTrigger>
                            Open popover
                        </button>
                        <div class="z-50" *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
                            <div class="demo-popup relative w-80 p-4" rdxPopoverPopup>
                                <select-focus-controls
                                    [keepMounted]="keepMounted()"
                                    [closeOnFocusOut]="closeOnFocusOut()"
                                    [finalFocus]="finalFocus()"
                                    [cancelClose]="cancelClose()"
                                />
                                <button class="demo-button demo-button-outline mt-4 h-8 px-3 text-xs" rdxPopoverClose>
                                    Close popover
                                </button>
                            </div>
                        </div>
                    </ng-container>
                }
                @default {
                    <select-focus-controls
                        [keepMounted]="keepMounted()"
                        [closeOnFocusOut]="closeOnFocusOut()"
                        [finalFocus]="finalFocus()"
                        [cancelClose]="cancelClose()"
                    />
                }
            }
            <button class="demo-button demo-button-outline h-8 px-3 text-xs" data-testid="outside-layer" type="button">
                Outside layer
            </button>
        </div>
    `
})
export class SelectFocusManagement {
    readonly shell = input<'inline' | 'dialog' | 'popover'>('inline');
    readonly keepMounted = input(true);
    readonly closeOnFocusOut = input(false);
    readonly finalFocus = input<'default' | 'after' | 'none'>('default');
    readonly cancelClose = input(false);
}
