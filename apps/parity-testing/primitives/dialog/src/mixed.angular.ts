import { Component } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { dialogImports, type RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { classes, config, installProbe, type NestedLayer } from './contract';

@Component({
    selector: 'parity-dialog',
    imports: [dialogImports, drawerImports, alertDialogImports],
    template: `
        <main class="flex gap-2">
            <button
                [class]="styles.trigger"
                (click)="trace.probe.activations = trace.probe.activations + 1"
                type="button"
                data-testid="outside"
            >
                Outside
            </button>
            <div (onOpenChange)="change($event)" (onOpenChangeComplete)="complete($event)" rdxDrawerRoot>
                <button id="primary" [class]="styles.trigger" rdxDrawerTrigger data-testid="primary">
                    Open drawer
                </button>
                <ng-template rdxDrawerPortal>
                    <div [class]="styles.backdrop" rdxDrawerBackdrop data-testid="backdrop"></div>
                    <div class="fixed inset-0" rdxDrawerViewport>
                        <div [class]="styles.popup" rdxDrawerPopup data-testid="popup">
                            <h2 rdxDrawerTitle>Parent drawer</h2>
                            <input [class]="styles.input" aria-label="Parent drawer draft" data-testid="field" />
                            <div
                                (onOpenChange)="change($event, 'child')"
                                (onOpenChangeComplete)="complete($event, 'child')"
                                rdxDrawerRoot
                            >
                                <button
                                    id="child-trigger"
                                    [class]="styles.trigger"
                                    rdxDrawerTrigger
                                    data-testid="child-trigger"
                                >
                                    Open nested drawer
                                </button>
                                <ng-template rdxDrawerPortal>
                                    <div [class]="styles.backdrop" rdxDrawerBackdrop data-testid="child-backdrop"></div>
                                    <div class="fixed inset-0" rdxDrawerViewport>
                                        <div [class]="styles.popup" rdxDrawerPopup data-testid="child-popup">
                                            <h2 rdxDrawerTitle>Nested drawer</h2>
                                            <input
                                                [class]="styles.input"
                                                aria-label="Nested drawer draft"
                                                data-testid="child-field"
                                            />
                                            @if (variant === 'alert-dialog') {
                                                <div
                                                    (onOpenChange)="change($event, 'grandchild')"
                                                    (onOpenChangeComplete)="complete($event, 'grandchild')"
                                                    rdxAlertDialogRoot
                                                >
                                                    <button
                                                        id="grandchild-trigger"
                                                        [class]="styles.trigger"
                                                        rdxAlertDialogTrigger
                                                        data-testid="grandchild-trigger"
                                                    >
                                                        Open alert dialog
                                                    </button>
                                                    <ng-template rdxAlertDialogPortal>
                                                        <div
                                                            [class]="styles.backdrop"
                                                            rdxAlertDialogBackdrop
                                                            data-testid="grandchild-backdrop"
                                                        ></div>
                                                        <div
                                                            [class]="styles.popup"
                                                            rdxAlertDialogPopup
                                                            data-testid="grandchild-popup"
                                                        >
                                                            <h2 rdxAlertDialogTitle>Alert dialog</h2>
                                                            <input
                                                                [class]="styles.input"
                                                                aria-label="Alert draft"
                                                                data-testid="grandchild-field"
                                                            />
                                                            <button
                                                                [class]="styles.trigger"
                                                                rdxAlertDialogClose
                                                                data-testid="grandchild-close"
                                                            >
                                                                Close
                                                            </button>
                                                        </div>
                                                    </ng-template>
                                                </div>
                                            } @else {
                                                <div
                                                    (onOpenChange)="change($event, 'grandchild')"
                                                    (onOpenChangeComplete)="complete($event, 'grandchild')"
                                                    rdxDialogRoot
                                                >
                                                    <button
                                                        id="grandchild-trigger"
                                                        [class]="styles.trigger"
                                                        rdxDialogTrigger
                                                        data-testid="grandchild-trigger"
                                                    >
                                                        Open dialog
                                                    </button>
                                                    <ng-template rdxDialogPortal>
                                                        <div
                                                            [class]="styles.backdrop"
                                                            rdxDialogBackdrop
                                                            data-testid="grandchild-backdrop"
                                                        ></div>
                                                        <div
                                                            [class]="styles.popup"
                                                            rdxDialogPopup
                                                            data-testid="grandchild-popup"
                                                        >
                                                            <h2 rdxDialogTitle>Dialog</h2>
                                                            <input
                                                                [class]="styles.input"
                                                                aria-label="Dialog draft"
                                                                data-testid="grandchild-field"
                                                            />
                                                            <button
                                                                [class]="styles.trigger"
                                                                rdxDialogClose
                                                                data-testid="grandchild-close"
                                                            >
                                                                Close
                                                            </button>
                                                        </div>
                                                    </ng-template>
                                                </div>
                                            }
                                            <button [class]="styles.trigger" rdxDrawerClose data-testid="child-close">
                                                Close nested drawer
                                            </button>
                                        </div>
                                    </div>
                                </ng-template>
                            </div>
                            <button [class]="styles.trigger" rdxDrawerClose data-testid="close">Close drawer</button>
                        </div>
                    </div>
                </ng-template>
            </div>
        </main>
    `
})
export class AngularMixedDialogs {
    readonly variant = config().mixed;
    readonly styles = classes;
    readonly trace = installProbe();

    change({ open, eventDetails }: RdxDialogOpenChange, layer?: NestedLayer) {
        this.trace.change(
            open,
            eventDetails.reason,
            eventDetails.event,
            eventDetails.trigger,
            eventDetails.isCanceled(),
            layer
        );
    }

    complete(open: boolean, layer?: NestedLayer) {
        if (layer) this.trace.probe.nestedCompletions.push({ layer, open });
        else this.trace.probe.completions.push(open);
    }
}
