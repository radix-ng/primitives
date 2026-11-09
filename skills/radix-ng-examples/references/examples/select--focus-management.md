# Select — Focus management

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

The popup owns DOM focus and uses `aria-activedescendant` for virtual navigation. Arrow keys and
typeahead update the highlight; Enter or Space commits a selection. The existing default keeps
Tab/Shift+Tab inside the open Select and does not close on focus-out.

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
import { dialogImports } from '@radix-ng/primitives/dialog';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoDialog, demoPopover, demoSelect } from '../../storybook/styles';
import { _importsSelect, RdxSelectOpenChangeEvent } from '../index';

@Component({
    selector: 'select-focus-controls',
    imports: [_importsSelect, LucideCheck, LucideChevronDown],
    template: `
        <div class="grid w-64 gap-3">
            <button [class]="buttonClass" data-testid="before-select" type="button">Before select</button>
            <ng-container
                [(open)]="open"
                [modal]="false"
                (onOpenChange)="onOpenChange($event)"
                (onOpenChangeComplete)="completed.set($event ? 'Opened' : 'Closed')"
                defaultValue="Apple"
                rdxSelectRoot
            >
                <div class="text-sm font-medium" rdxSelectLabel>Fruit</div>
                <button [class]="s.trigger" rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                    <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                    <div [class]="s.positioner" sideOffset="5" rdxSelectPositioner>
                        <div
                            [class]="s.popup"
                            [closeOnFocusOut]="closeOnFocusOut()"
                            [finalFocus]="
                                finalFocus() === 'after' ? after : finalFocus() === 'none' ? false : undefined
                            "
                            rdxSelectPopup
                        >
                            <div [class]="s.list" rdxSelectList>
                                @for (fruit of fruits; track fruit) {
                                    <div [class]="s.item" [value]="fruit" rdxSelectItem>
                                        <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                            <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                        </span>
                                        <span rdxSelectItemText>{{ fruit }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <button #after [class]="buttonClass" data-testid="after-select" type="button">After select</button>
            <output class="text-muted-foreground text-xs" data-testid="focus-state">
                {{ open() ? 'Open' : 'Closed' }}
            </output>
            <output class="text-muted-foreground text-xs" data-testid="focus-reason">{{ reason() }}</output>
            <output class="text-muted-foreground text-xs" data-testid="focus-complete">{{ completed() }}</output>
        </div>
    `
})
export class SelectFocusControls {
    protected readonly s = demoSelect;
    protected readonly buttonClass = cn(demoButton.base, demoButton.outline, demoButton.size.sm);
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
    imports: [SelectFocusControls, ...dialogImports, ...popoverImports],
    template: `
        <div class="grid justify-items-start gap-4">
            @switch (shell()) {
                @case ('dialog') {
                    <ng-container rdxDialogRoot>
                        <button [class]="buttonClass" rdxDialogTrigger>Open dialog</button>
                        <ng-template rdxDialogPortal>
                            <div [class]="d.backdrop" rdxDialogBackdrop></div>
                            <div [class]="d.popup" rdxDialogPopup>
                                <h2 [class]="d.title" rdxDialogTitle>Choose a fruit</h2>
                                <p [class]="d.description" rdxDialogDescription>Use the Select, then continue below.</p>
                                <select-focus-controls
                                    [keepMounted]="keepMounted()"
                                    [closeOnFocusOut]="closeOnFocusOut()"
                                    [finalFocus]="finalFocus()"
                                    [cancelClose]="cancelClose()"
                                />
                                <button class="mt-4" [class]="buttonClass" rdxDialogClose>Close dialog</button>
                            </div>
                        </ng-template>
                    </ng-container>
                }
                @case ('popover') {
                    <ng-container rdxPopoverRoot>
                        <button [class]="buttonClass" rdxPopoverTrigger>Open popover</button>
                        <div *rdxPopoverPortal [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                            <div [class]="p.popup" rdxPopoverPopup>
                                <select-focus-controls
                                    [keepMounted]="keepMounted()"
                                    [closeOnFocusOut]="closeOnFocusOut()"
                                    [finalFocus]="finalFocus()"
                                    [cancelClose]="cancelClose()"
                                />
                                <button class="mt-4" [class]="buttonClass" rdxPopoverClose>Close popover</button>
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
            <button [class]="buttonClass" data-testid="outside-layer" type="button">Outside layer</button>
        </div>
    `
})
export class SelectFocusManagement {
    protected readonly d = demoDialog;
    protected readonly p = demoPopover;
    protected readonly buttonClass = cn(demoButton.base, demoButton.outline, demoButton.size.sm);
    readonly shell = input<'inline' | 'dialog' | 'popover'>('inline');
    readonly keepMounted = input(true);
    readonly closeOnFocusOut = input(false);
    readonly finalFocus = input<'default' | 'after' | 'none'>('default');
    readonly cancelClose = input(false);
}
```
