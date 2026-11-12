import { Component, ElementRef, viewChild } from '@angular/core';
import { RdxMenuModule, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { classes, config, installProbe, type Layer } from './contract';

@Component({
    selector: 'parity-menu',
    imports: [RdxMenuModule],
    template: `
        <div [class]="s.layout">
            <input #rootFinal data-testid="root-final" aria-label="Root return target" />
            <button data-testid="outside">Background</button>
            <ng-container
                (onOpenChange)="change('main', $event)"
                (onOpenChangeComplete)="trace.complete('main', $event)"
                rdxMenuRoot
            >
                <button [class]="s.trigger" data-testid="primary" rdxMenuTrigger>Actions</button>
                <ng-template [keepMounted]="settings.retained" rdxMenuPortal>
                    <div class="z-50" sideOffset="4" data-testid="positioner" rdxMenuPositioner>
                        <div
                            [class]="s.popup"
                            [finalFocus]="settings.rootPolicy === 'target' ? rootFinal : rootPolicy"
                            data-testid="popup"
                            rdxMenuPopup
                        >
                            @if (settings.childPolicy) {
                                <input #childFinal data-testid="child-final" aria-label="Child return target" />
                            }
                            @if (settings.nested) {
                                <ng-container
                                    (onOpenChange)="change('sub', $event)"
                                    (onOpenChangeComplete)="trace.complete('sub', $event)"
                                    rdxMenuRoot
                                >
                                    <button [class]="s.item" data-testid="more" rdxMenuSubTrigger>More</button>
                                    <ng-template [keepMounted]="settings.retained" rdxMenuPortal>
                                        <div class="z-50" side="right" sideOffset="4" rdxMenuPositioner>
                                            <div
                                                [class]="s.popup"
                                                [finalFocus]="
                                                    settings.childPolicy === 'target'
                                                        ? childFinal()?.nativeElement
                                                        : childPolicy
                                                "
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
                            } @else {
                                <button [class]="s.item" data-testid="alpha" rdxMenuItem>Action</button>
                            }
                            @if (settings.parentControl) {
                                <input data-testid="parent-control" aria-label="Parent control" />
                            }
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <input data-testid="after" aria-label="After menu" />
        </div>
    `
})
export class AngularFocusBoundary {
    readonly s = classes;
    readonly settings = config().focusBoundary!;
    readonly trace = installProbe('angular');
    readonly rootFinal = viewChild.required('rootFinal', { read: ElementRef<HTMLElement> });
    readonly childFinal = viewChild('childFinal', { read: ElementRef<HTMLElement> });
    readonly rootPolicy = this.policy('main', this.settings.rootPolicy);
    readonly childPolicy = this.policy('sub', this.settings.childPolicy);
    constructor() {
        window.menuParity.finalFocusCalls = [];
    }
    private policy(layer: Layer, mode: string | undefined) {
        if (!mode) return undefined;
        if (mode === 'false') return false;
        if (mode === 'target') return undefined;
        return (type: string | null) => {
            if (mode === 'callback') window.menuParity.finalFocusCalls!.push({ layer, type });
            return layer === 'main' ? this.rootFinal().nativeElement : (this.childFinal()?.nativeElement ?? null);
        };
    }
    change(layer: Layer, change: RdxMenuOpenChange) {
        if (
            !change.open &&
            change.reason === 'focus-out' &&
            (layer === 'main' ? this.settings.cancelRoot : this.settings.cancelChild)
        )
            change.eventDetails.cancel();
        this.trace.change(
            layer,
            change.open,
            change.reason,
            change.eventDetails.isCanceled(),
            change.event,
            change.trigger
        );
    }
}
