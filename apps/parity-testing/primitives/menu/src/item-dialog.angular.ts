import { Component, signal, viewChild } from '@angular/core';
import { createRdxDialogHandle, dialogImports, type RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { menuImports, RdxMenuRoot, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { heldExitClass } from '../../../shared/lifecycle';
import { config, installProbe, classes as s, type Layer } from './contract';
import { createDialogProbe, dialogClass } from './dialog';

@Component({
    selector: 'parity-dialog-surface',
    imports: [...dialogImports],
    host: { class: 'contents' },
    template: `
        <ng-template rdxDialogPortal>
            <div [class]="dialogClass" data-testid="dialog-popup" rdxDialogPopup>
                <h2 rdxDialogTitle>Confirm command</h2>
                <p rdxDialogDescription>Opened by a menu item.</p>
                <button data-testid="dialog-cancel" rdxDialogClose>Cancel</button>
                <button data-testid="dialog-confirm" rdxDialogClose>Confirm</button>
            </div>
        </ng-template>
    `
})
class DialogSurface {
    readonly dialogClass = dialogClass;
}

@Component({
    selector: 'parity-menu',
    imports: [...menuImports, ...dialogImports, DialogSurface],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            <input data-testid="before" aria-label="Before menu" />
            <ng-container
                (onOpenChange)="change('main', $event)"
                (onOpenChangeComplete)="trace.complete('main', $event)"
                rdxMenuRoot
            >
                <button [class]="s.trigger" data-testid="primary" rdxMenuTrigger>Actions</button>
                <ng-template [keepMounted]="settings.retained" rdxMenuPortal>
                    <div class="z-10" data-testid="positioner" align="start" sideOffset="4" rdxMenuPositioner>
                        <div [class]="s.popup + (settings.animated ? exitClass : '')" data-testid="popup" rdxMenuPopup>
                            @if (settings.stayOpen) {
                                <ng-container
                                    (onOpenChange)="dialogChange($event)"
                                    (onOpenChangeComplete)="dialog.completions.push($event)"
                                    rdxDialogRoot
                                >
                                    <button
                                        [class]="s.item"
                                        [closeOnClick]="false"
                                        (onSelect)="trace.select('alpha')"
                                        data-testid="alpha"
                                        rdxMenuItem
                                        rdxDialogTrigger
                                    >
                                        Open dialog
                                    </button>
                                    <parity-dialog-surface />
                                </ng-container>
                            } @else if (settings.nested) {
                                <ng-container
                                    (onOpenChange)="change('sub', $event)"
                                    (onOpenChangeComplete)="trace.complete('sub', $event)"
                                    rdxMenuRoot
                                >
                                    <button [class]="s.item" data-testid="more" rdxMenuSubTrigger>More</button>
                                    <ng-template rdxMenuPortal>
                                        <div class="z-20" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                                            <div [class]="s.popup" data-testid="sub-popup" rdxMenuPopup>
                                                <button
                                                    [class]="s.item"
                                                    (onSelect)="activate('sub-alpha')"
                                                    data-testid="sub-alpha"
                                                    rdxMenuItem
                                                >
                                                    Open dialog
                                                </button>
                                            </div>
                                        </div>
                                    </ng-template>
                                </ng-container>
                            } @else if (settings.composed) {
                                <button
                                    [class]="s.item"
                                    [handle]="dialogHandle"
                                    (onSelect)="trace.select('alpha')"
                                    data-testid="alpha"
                                    rdxMenuItem
                                    rdxDialogTrigger
                                >
                                    Open dialog
                                </button>
                            } @else {
                                <button [class]="s.item" (onSelect)="activate('alpha')" data-testid="alpha" rdxMenuItem>
                                    Open dialog
                                </button>
                            }
                            <button [class]="s.item" data-testid="omega" rdxMenuItem>Other action</button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            @if (!settings.stayOpen) {
                <ng-container
                    [(open)]="dialogOpen"
                    [handle]="dialogHandle"
                    (onOpenChange)="dialogChange($event)"
                    (onOpenChangeComplete)="dialog.completions.push($event)"
                    rdxDialogRoot
                >
                    <parity-dialog-surface />
                </ng-container>
            }
            <input data-testid="after" aria-label="After menu" />
        </div>
    `
})
export class AngularItemDialog {
    readonly s = s;
    readonly settings = config().itemDialog!;
    readonly exitClass = heldExitClass;
    readonly trace = installProbe('angular');
    readonly dialog = createDialogProbe();
    readonly dialogOpen = signal(false);
    readonly dialogHandle = createRdxDialogHandle();
    private readonly menu = viewChild(RdxMenuRoot);
    constructor() {
        this.trace.probe.dialog = this.dialog;
    }
    activate(id: string) {
        this.trace.select(id);
        this.dialogOpen.set(true);
    }
    command(event: KeyboardEvent) {
        if (event.key !== 'F3') return;
        event.preventDefault();
        this.menu()?.unmount();
    }
    change(layer: Layer, change: RdxMenuOpenChange) {
        if (!change.open && this.settings.canceledClose) change.eventDetails.cancel();
        if (!change.open && this.settings.deferred) change.eventDetails.preventUnmountOnClose();
        this.trace.change(
            layer,
            change.open,
            change.reason,
            change.eventDetails.isCanceled(),
            change.event,
            change.trigger
        );
    }
    dialogChange(change: RdxDialogOpenChange) {
        if (change.open && this.settings.canceledOpen) change.eventDetails.cancel();
        this.dialog.changes.push({
            open: change.open,
            reason: change.reason,
            canceled: change.eventDetails.isCanceled()
        });
        this.dialog.nativeEvents.push({ type: change.event.type, trusted: change.event.isTrusted });
    }
}
