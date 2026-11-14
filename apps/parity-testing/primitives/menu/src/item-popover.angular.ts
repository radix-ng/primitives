import { Component, input, signal, viewChild } from '@angular/core';
import { menuImports, RdxMenuRoot, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { createRdxPopoverHandle, popoverImports, type RdxPopoverOpenChange } from '@radix-ng/primitives/popover';
import { heldExitClass } from '../../../shared/lifecycle';
import { config, installProbe, classes as s, type Layer } from './contract';
import { itemPopoverClass } from './item-popover';
import { createOverlayProbe } from './overlay-probe';

@Component({
    selector: 'parity-popover-surface',
    imports: [...popoverImports],
    host: { class: 'contents' },
    template: `
        <ng-template rdxPopoverPortal>
            <div class="z-30" [anchor]="anchor()" side="right" align="start" sideOffset="8" rdxPopoverPositioner>
                <div [class]="popoverClass" data-testid="item-popup" rdxPopoverPopup>
                    <h2 rdxPopoverTitle>Command details</h2>
                    <p rdxPopoverDescription>Opened by a menu item.</p>
                    <button data-testid="popover-cancel" rdxPopoverClose>Cancel</button>
                    <button data-testid="popover-confirm" rdxPopoverClose>Confirm</button>
                </div>
            </div>
        </ng-template>
    `
})
export class PopoverSurface {
    readonly anchor = input.required<HTMLElement>();
    readonly popoverClass = itemPopoverClass;
}

@Component({
    selector: 'parity-menu',
    imports: [...menuImports, ...popoverImports, PopoverSurface],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            <input data-testid="before" aria-label="Before menu" />
            <ng-container
                (onOpenChange)="change('main', $event)"
                (onOpenChangeComplete)="trace.complete('main', $event)"
                rdxMenuRoot
            >
                <button #menuAnchor [class]="s.trigger" data-testid="primary" rdxMenuTrigger>Actions</button>
                <ng-template [keepMounted]="settings.retained" rdxMenuPortal>
                    <div class="z-10" data-testid="positioner" align="start" sideOffset="4" rdxMenuPositioner>
                        <div [class]="s.popup + (settings.animated ? exitClass : '')" data-testid="popup" rdxMenuPopup>
                            @if (settings.stayOpen && !settings.composed) {
                                <ng-container
                                    [modal]="settings.modal"
                                    (onOpenChange)="popoverChange($event)"
                                    (onOpenChangeComplete)="popover.completions.push($event)"
                                    rdxPopoverRoot
                                >
                                    <button
                                        #itemAnchor
                                        [class]="s.item"
                                        [closeOnClick]="false"
                                        (onSelect)="trace.select('alpha')"
                                        data-testid="alpha"
                                        rdxMenuItem
                                        rdxPopoverTrigger
                                    >
                                        Open popover
                                    </button>
                                    <parity-popover-surface [anchor]="itemAnchor" />
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
                                                    Open popover
                                                </button>
                                            </div>
                                        </div>
                                    </ng-template>
                                </ng-container>
                            } @else if (settings.composed) {
                                <button
                                    [class]="s.item"
                                    [closeOnClick]="false"
                                    [handle]="popoverHandle"
                                    (onSelect)="trace.select('alpha')"
                                    data-testid="alpha"
                                    rdxMenuItem
                                    rdxPopoverTrigger
                                >
                                    Open popover
                                </button>
                            } @else {
                                <button [class]="s.item" (onSelect)="activate('alpha')" data-testid="alpha" rdxMenuItem>
                                    Open popover
                                </button>
                            }
                            <button [class]="s.item" data-testid="omega" rdxMenuItem>Other action</button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            @if (!settings.stayOpen || settings.composed) {
                <ng-container
                    [(open)]="popoverOpen"
                    [handle]="popoverHandle"
                    (onOpenChange)="popoverChange($event)"
                    (onOpenChangeComplete)="popover.completions.push($event)"
                    rdxPopoverRoot
                >
                    <parity-popover-surface [anchor]="menuAnchor" />
                </ng-container>
            }
            <input data-testid="after" aria-label="After menu" />
        </div>
    `
})
export class AngularItemPopover {
    readonly s = s;
    readonly settings = config().itemPopover!;
    readonly exitClass = heldExitClass;
    readonly trace = installProbe('angular');
    readonly popover = createOverlayProbe();
    readonly popoverOpen = signal(false);
    readonly popoverHandle = createRdxPopoverHandle();
    private readonly menu = viewChild(RdxMenuRoot);
    constructor() {
        this.trace.probe.popover = this.popover;
    }
    activate(id: string) {
        this.trace.select(id);
        this.popoverOpen.set(true);
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
    popoverChange(change: RdxPopoverOpenChange) {
        if (change.open && this.settings.canceledOpen) change.eventDetails.cancel();
        this.popover.changes.push({
            open: change.open,
            reason: change.reason,
            canceled: change.eventDetails.isCanceled()
        });
        this.popover.nativeEvents.push({ type: change.event.type, trusted: change.event.isTrusted });
    }
}
