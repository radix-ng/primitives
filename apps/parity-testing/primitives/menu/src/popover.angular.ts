import { Component, signal, viewChild } from '@angular/core';
import { menuImports, RdxMenuRoot, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { popoverImports, type RdxPopoverOpenChange } from '@radix-ng/primitives/popover';
import { heldExitClass } from '../../../shared/lifecycle';
import { config, installProbe, classes as s, type Layer } from './contract';
import { createOverlayProbe } from './overlay-probe';
import { popoverHostClass } from './popover';

@Component({
    selector: 'parity-menu',
    imports: [...menuImports, ...popoverImports],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div class="fixed start-24 top-8 grid gap-3">
            @if (mounted()) {
                <ng-container
                    [(open)]="open"
                    [modal]="settings.parentModal"
                    (onOpenChange)="parentChange($event)"
                    (onOpenChangeComplete)="parent.completions.push($event)"
                    rdxPopoverRoot
                >
                    <button [class]="s.trigger" data-testid="host-trigger" rdxPopoverTrigger>Open popover</button>
                    <ng-template rdxPopoverPortal>
                        <div class="z-10" align="start" sideOffset="8" rdxPopoverPositioner>
                            <div [class]="hostClass" data-testid="host-popup" rdxPopoverPopup>
                                <h2 rdxPopoverTitle>Menu host</h2>
                                <p rdxPopoverDescription>Commands inside a popover.</p>
                                <button class="w-fit" data-testid="host-before">Before menu</button>
                                <ng-container
                                    [modal]="settings.menuModal"
                                    (onOpenChange)="change('main', $event)"
                                    (onOpenChangeComplete)="trace.complete('main', $event)"
                                    rdxMenuRoot
                                >
                                    <button [class]="s.trigger + ' w-28'" data-testid="primary" rdxMenuTrigger>
                                        Actions
                                    </button>
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
                                                                <div
                                                                    [class]="s.popup"
                                                                    data-testid="sub-popup"
                                                                    rdxMenuPopup
                                                                >
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
                                                <button [class]="s.item" data-testid="omega" rdxMenuItem>
                                                    Last action
                                                </button>
                                            </div>
                                        </div>
                                    </ng-template>
                                </ng-container>
                                <button class="w-fit" data-testid="host-after">After menu</button>
                                <button class="w-fit" data-testid="host-close" rdxPopoverClose>Close popover</button>
                            </div>
                        </div>
                    </ng-template>
                </ng-container>
            }
        </div>
        <input class="fixed start-2 bottom-2" data-testid="after" aria-label="Background" />
    `
})
export class AngularPopoverMenu {
    readonly s = s;
    readonly hostClass = popoverHostClass;
    readonly exitClass = heldExitClass;
    readonly settings = config().popover!;
    readonly trace = installProbe('angular');
    readonly parent = createOverlayProbe();
    readonly mounted = signal(true);
    readonly open = signal(false);
    private readonly menu = viewChild(RdxMenuRoot);
    constructor() {
        this.trace.probe.popover = this.parent;
    }
    command(event: KeyboardEvent) {
        if (!['F3', 'F4', 'F5', 'F6'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F3') this.menu()?.unmount();
        if (event.key === 'F4') this.open.set(false);
        if (event.key === 'F5') {
            this.mounted.set(false);
            this.open.set(false);
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
    parentChange(change: RdxPopoverOpenChange) {
        this.parent.changes.push({
            open: change.open,
            reason: change.reason,
            canceled: change.eventDetails.isCanceled()
        });
        this.parent.nativeEvents.push({ type: change.event.type, trusted: change.event.isTrusted });
    }
}
