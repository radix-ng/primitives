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
