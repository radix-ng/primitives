# Select — Focus management

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The popup owns DOM focus and uses `aria-activedescendant` for virtual navigation. Arrow keys and
typeahead update the highlight; Enter or Space commits a selection. The existing default keeps
Tab/Shift+Tab inside the open Select and does not close on focus-out.

ArrowDown, ArrowUp, Home and End can highlight disabled options, including an already selected
disabled option. Their `aria-disabled` state remains exposed; Enter, Space and pointer activation
cannot select them or close the popup. Typeahead skips disabled options when matching labels.

Set `[closeOnFocusOut]="true"` on **Popup** to opt into the shared focus manager's focus-out policy.
Forward Tab moves to the next control after the trigger and closes with reason `focus-out`, without
committing the highlight. Shift+Tab requests closing back to the trigger. A canceled `onOpenChange`
request leaves the Select open. Moving focus to another control programmatically closes and preserves
that target; moving into a related child layer remains inside.

`finalFocus` accepts an element, `false`, or an interaction callback. It works with ordinary and
keep-mounted views. A closed retained popup no longer keeps its parent focus scope paused. Escape
closes the current layer and returns focus, while deliberate outside focus is preserved by default.

The opt-in preserves virtual navigation. Changing the default focus policy or moving DOM focus to
items still requires the real screen-reader review tracked in
[ADR 0027](https://github.com/radix-ng/primitives/blob/main/docs/adr/0027-select-focus-policy-and-retained-scopes.md).
Use this story's controls to compare both policies and the Dialog/Popover shells.

```typescript
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
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.

#### `./select-typed-control.ts`

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    provideRdxSelectRoot,
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

/** Application-owned markup; all state, events and form bindings are inherited from the primitive. */
@Component({
    selector: 'example-select',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideRdxSelectRoot(SelectTypedControl)],
    imports: [
        LucideCheck,
        LucideChevronDown,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator
    ],
    template: `
        <button
            class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-64 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
            rdxSelectTrigger
        >
            <span #display="rdxSelectedValue" [placeholder]="placeholder()" rdxSelectValue>
                {{ display.slotText() }}
            </span>
            <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
        </button>
        <div class="z-[100]" *rdxSelectPortal [sideOffset]="4" align="start" rdxSelectPositioner>
            <div
                class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                rdxSelectPopup
            >
                <div class="p-1" rdxSelectList>
                    @for (option of options(); track option) {
                        <div
                            class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            [value]="option"
                            rdxSelectItem
                        >
                            <span
                                class="absolute start-0 inline-flex w-6 items-center justify-center"
                                aria-hidden="true"
                                rdxSelectItemIndicator
                            >
                                <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                            </span>
                            <span rdxSelectItemText>{{ itemToStringLabel()?.(option) ?? option }}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class SelectTypedControl<Value = unknown, Multiple extends boolean = false> extends RdxSelectRoot<
    Value,
    Multiple
> {
    readonly options = input.required<readonly Value[]>();
    readonly placeholder = input('Select an option');
}
```
