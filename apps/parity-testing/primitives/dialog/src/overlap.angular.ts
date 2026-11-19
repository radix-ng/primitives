import { Component, signal } from '@angular/core';
import { dialogImports, type RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { classes, config, installProbe, overlappingLayers, type OverlappingLayer } from './contract';

@Component({
    selector: 'parity-dialog',
    imports: [dialogImports],
    template: `
        <main>
            <button
                [class]="styles.trigger"
                (click)="trace.probe.activations = trace.probe.activations + 1"
                type="button"
                data-testid="outside"
            >
                Outside
            </button>
            @for (layer of layers; track layer; let index = $index) {
                <div
                    [open]="open()[layer]"
                    (onOpenChange)="change(layer, $event)"
                    (openChange)="setOpen(layer, $event)"
                    (onOpenChangeComplete)="trace.probe.overlappingCompletions.push({ layer, open: $event })"
                    rdxDialogRoot
                >
                    @if (index === 0) {
                        <button id="primary" [class]="styles.trigger" rdxDialogTrigger data-testid="primary">
                            Open first
                        </button>
                    }
                    <ng-template [keepMounted]="settings?.keepMounted ?? false" rdxDialogPortal>
                        @if (settings?.backdrop) {
                            <div
                                [class]="styles.backdrop"
                                [style.z-index]="index * 2 + 1"
                                [attr.data-testid]="layer + '-backdrop'"
                                rdxDialogBackdrop
                            ></div>
                        }
                        <div
                            [class]="styles.popup"
                            [style.z-index]="index * 2 + 2"
                            [attr.data-testid]="layer + '-popup'"
                            rdxDialogPopup
                        >
                            <h2 rdxDialogTitle>Dialog {{ layer }}</h2>
                            <input
                                [class]="styles.input"
                                [attr.data-testid]="layer + '-field'"
                                [attr.aria-label]="layer + ' field'"
                            />
                            @if (layers[index + 1]; as next) {
                                <button
                                    [class]="styles.trigger"
                                    [attr.data-testid]="'open-' + next"
                                    (click)="setOpen(next, true)"
                                    type="button"
                                >
                                    Open {{ next }}
                                </button>
                            }
                            <button [class]="styles.trigger" [attr.data-testid]="layer + '-close'" rdxDialogClose>
                                Close {{ layer }}
                            </button>
                        </div>
                    </ng-template>
                </div>
            }
        </main>
    `
})
export class AngularOverlappingDialogs {
    readonly settings = config().overlap;
    readonly layers = overlappingLayers;
    readonly styles = classes;
    readonly trace = installProbe();
    readonly open = signal<Record<OverlappingLayer, boolean>>({ first: false, second: false, third: false });

    setOpen(layer: OverlappingLayer, open: boolean) {
        this.open.update((current) => ({ ...current, [layer]: open }));
    }

    change(layer: OverlappingLayer, change: RdxDialogOpenChange) {
        this.trace.change(
            change.open,
            change.reason,
            change.event,
            change.trigger,
            change.eventDetails.isCanceled(),
            layer
        );
    }
}
