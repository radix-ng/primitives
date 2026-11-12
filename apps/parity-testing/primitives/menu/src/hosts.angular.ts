import { Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { classes, config } from './contract';
import { installHostProbe } from './hosts-probe';
@Component({
    selector: 'parity-menu',
    imports: [RdxMenuModule],
    template: `
        <div [class]="s.layout">
            @if (h.form) {
                <form id="host-form" (submit)="$event.preventDefault(); submitted()"></form>
            }
            <button data-testid="outside">Background</button>
            <ng-container
                (onOpenChange)="
                    trace.change(
                        'main',
                        $event.open,
                        $event.reason,
                        $event.eventDetails.isCanceled(),
                        $event.event,
                        $event.trigger
                    )
                "
                (onOpenChangeComplete)="trace.complete('main', $event)"
                rdxMenuRoot
            >
                <button [class]="s.trigger" data-testid="primary" rdxMenuTrigger>Actions</button>
                <ng-template [keepMounted]="h.retained" rdxMenuPortal>
                    <div class="z-50" align="start" sideOffset="4" data-testid="positioner" rdxMenuPositioner>
                        <div [class]="s.popup" data-testid="popup" rdxMenuPopup>
                            @if (h.submenu) {
                                <ng-container
                                    (onOpenChange)="
                                        trace.change(
                                            'sub',
                                            $event.open,
                                            $event.reason,
                                            $event.eventDetails.isCanceled(),
                                            $event.event,
                                            $event.trigger
                                        )
                                    "
                                    (onOpenChangeComplete)="trace.complete('sub', $event)"
                                    rdxMenuRoot
                                >
                                    @if (h.tag === 'button') {
                                        <button
                                            [class]="s.item"
                                            [disabled]="h.disabled"
                                            data-testid="more"
                                            rdxMenuSubTrigger
                                        >
                                            Action
                                        </button>
                                    } @else {
                                        <div
                                            [class]="s.item"
                                            [disabled]="h.disabled"
                                            data-testid="more"
                                            rdxMenuSubTrigger
                                        >
                                            Action
                                        </div>
                                    }
                                    <div
                                        class="z-50"
                                        *rdxMenuPortal
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
                                                Child
                                            </button>
                                        </div>
                                    </div>
                                </ng-container>
                            } @else if (h.link) {
                                <a
                                    [class]="s.item"
                                    (onSelect)="trace.select('action')"
                                    (click)="trace.clicked($event)"
                                    href="#host-target"
                                    data-testid="action"
                                    rdxMenuLinkItem
                                >
                                    Action
                                </a>
                            } @else if (h.tag === 'a') {
                                <a
                                    [class]="s.item"
                                    [disabled]="h.disabled"
                                    (onSelect)="trace.select('action')"
                                    (click)="trace.clicked($event)"
                                    href="#host-target"
                                    data-testid="action"
                                    rdxMenuItem
                                >
                                    Action
                                </a>
                            } @else if (h.submit) {
                                <button
                                    [class]="s.item"
                                    [closeOnClick]="false"
                                    (onSelect)="trace.select('action')"
                                    (click)="trace.clicked($event)"
                                    type="submit"
                                    form="host-form"
                                    data-testid="action"
                                    rdxMenuItem
                                >
                                    Action
                                </button>
                            } @else if (h.tag === 'button') {
                                <button
                                    [class]="s.item"
                                    [disabled]="h.disabled"
                                    [attr.form]="h.form ? 'host-form' : undefined"
                                    [closeOnClick]="!h.form"
                                    (onSelect)="trace.select('action')"
                                    (click)="trace.clicked($event)"
                                    data-testid="action"
                                    rdxMenuItem
                                >
                                    Action
                                </button>
                            } @else {
                                <!-- RdxMenuItem owns keyboard activation and roving focus. -->
                                <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
                                <div
                                    [class]="s.item"
                                    [disabled]="h.disabled"
                                    (onSelect)="trace.select('action')"
                                    (click)="trace.clicked($event)"
                                    data-testid="action"
                                    rdxMenuItem
                                >
                                    Action
                                </div>
                            }
                            <button [class]="s.item" (onSelect)="trace.select('alpha')" data-testid="alpha" rdxMenuItem>
                                Alpha
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <input data-testid="after" aria-label="After menu" />
        </div>
    `
})
export class AngularHosts {
    readonly s = classes;
    readonly h = config().host!;
    readonly trace = installHostProbe('angular');
    submitted() {
        window.menuParity.hostSubmissions = (window.menuParity.hostSubmissions ?? 0) + 1;
    }
}
