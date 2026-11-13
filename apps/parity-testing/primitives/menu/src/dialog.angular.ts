import { Component, signal, viewChild } from '@angular/core';
import { RdxDialogModule, type RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { RdxMenuModule, RdxMenuRoot, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { heldExitClass } from '../../../shared/lifecycle';
import { config, installProbe, classes as s, type Layer } from './contract';
import { createDialogProbe, dialogClass } from './dialog';

@Component({
    selector: 'parity-menu',
    imports: [RdxDialogModule, RdxMenuModule],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        @if (mounted()) {
            <ng-container
                [(open)]="dialogOpen"
                (onOpenChange)="dialogChange($event)"
                (onOpenChangeComplete)="dialog.completions.push($event)"
                rdxDialogRoot
            >
                <button class="fixed start-2 top-2" data-testid="dialog-trigger" rdxDialogTrigger>Open dialog</button>
                <ng-template rdxDialogPortal>
                    <div [class]="dialogClass" data-testid="dialog-popup" rdxDialogPopup>
                        <h2 rdxDialogTitle>Menu host</h2>
                        <p rdxDialogDescription>Commands inside a dialog.</p>
                        <button class="w-fit" data-testid="dialog-before">Before menu</button>
                        <ng-container
                            [modal]="settings.modal"
                            (onOpenChange)="change('main', $event)"
                            (onOpenChangeComplete)="trace.complete('main', $event)"
                            rdxMenuRoot
                        >
                            <button [class]="s.trigger + ' w-28'" data-testid="primary" rdxMenuTrigger>Actions</button>
                            <ng-template [keepMounted]="settings.retained" rdxMenuPortal>
                                <div
                                    class="z-20"
                                    data-testid="positioner"
                                    side="right"
                                    align="start"
                                    sideOffset="8"
                                    rdxMenuPositioner
                                >
                                    <div
                                        [class]="s.popup + (settings.animated ? exitClass : '')"
                                        data-testid="popup"
                                        rdxMenuPopup
                                    >
                                        <button
                                            [class]="s.item"
                                            (onSelect)="trace.select('alpha')"
                                            data-testid="alpha"
                                            rdxMenuItem
                                        >
                                            First action
                                        </button>
                                        @if (settings.nested) {
                                            <ng-container
                                                (onOpenChange)="change('sub', $event)"
                                                (onOpenChangeComplete)="trace.complete('sub', $event)"
                                                rdxMenuRoot
                                            >
                                                <button [class]="s.item" data-testid="more" rdxMenuSubTrigger>
                                                    More
                                                </button>
                                                <ng-template [keepMounted]="settings.retained" rdxMenuPortal>
                                                    <div
                                                        class="z-30"
                                                        side="right"
                                                        align="start"
                                                        sideOffset="4"
                                                        rdxMenuPositioner
                                                    >
                                                        <div [class]="s.popup" data-testid="sub-popup" rdxMenuPopup>
                                                            <button
                                                                [class]="s.item"
                                                                (onSelect)="trace.select('sub-alpha')"
                                                                data-testid="sub-alpha"
                                                                rdxMenuItem
                                                            >
                                                                Child action
                                                            </button>
                                                        </div>
                                                    </div>
                                                </ng-template>
                                            </ng-container>
                                        }
                                        <button [class]="s.item" data-testid="omega" rdxMenuItem>Last action</button>
                                    </div>
                                </div>
                            </ng-template>
                        </ng-container>
                        <button class="w-fit" data-testid="dialog-after">After menu</button>
                        <button class="w-fit" data-testid="dialog-close" rdxDialogClose>Close dialog</button>
                    </div>
                </ng-template>
            </ng-container>
        }
        <input class="fixed start-2 bottom-2" data-testid="after" aria-label="Background" />
    `
})
export class AngularDialogMenu {
    readonly s = s;
    readonly dialogClass = dialogClass;
    readonly exitClass = heldExitClass;
    readonly settings = config().dialog!;
    readonly trace = installProbe('angular');
    readonly dialog = createDialogProbe();
    readonly mounted = signal(true);
    readonly dialogOpen = signal(false);
    private readonly menu = viewChild(RdxMenuRoot);
    constructor() {
        this.trace.probe.dialog = this.dialog;
    }
    command(event: KeyboardEvent) {
        if (!['F3', 'F4', 'F5', 'F6'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F3') this.menu()?.unmount();
        if (event.key === 'F4') this.dialogOpen.set(false);
        if (event.key === 'F5') {
            this.mounted.set(false);
            this.dialogOpen.set(false);
        }
        if (event.key === 'F6') this.mounted.set(true);
    }
    change(layer: Layer, change: RdxMenuOpenChange) {
        if (!change.open && this.settings.canceled) change.eventDetails.cancel();
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
        this.dialog.changes.push({
            open: change.open,
            reason: change.reason,
            canceled: change.eventDetails.isCanceled()
        });
        this.dialog.nativeEvents.push({ type: change.event.type, trusted: change.event.isTrusted });
    }
}
