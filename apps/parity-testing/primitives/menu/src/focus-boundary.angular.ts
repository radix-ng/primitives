import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { RdxMenuModule, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { classes, config, installProbe, type Layer } from './contract';

@Component({
    selector: 'parity-menu',
    imports: [RdxMenuModule],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            @if (targetMounted() || settings.target?.layer !== 'main') {
                <input #rootFinal data-testid="root-final" aria-label="Root return target" />
            }
            @if (settings.target?.key === 'outside') {
                <input data-testid="outside" aria-label="Background field" />
            } @else {
                <button data-testid="outside">Background</button>
            }
            <ng-container
                [modal]="settings.target?.key !== 'outside'"
                (onOpenChange)="change('main', $event)"
                (onOpenChangeComplete)="trace.complete('main', $event)"
                rdxMenuRoot
            >
                <button [class]="s.trigger" data-testid="primary" rdxMenuTrigger>Actions</button>
                <ng-template [keepMounted]="settings.retained" rdxMenuPortal>
                    <div class="z-50" sideOffset="4" data-testid="positioner" rdxMenuPositioner>
                        <div
                            [class]="s.popup"
                            [finalFocus]="
                                settings.rootPolicy === 'target' || settings.rootPolicy === 'detached'
                                    ? target('main')
                                    : rootPolicy
                            "
                            data-testid="popup"
                            rdxMenuPopup
                        >
                            @if (settings.childPolicy && (targetMounted() || settings.target?.layer !== 'sub')) {
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
                                                    settings.childPolicy === 'target' ||
                                                    settings.childPolicy === 'detached'
                                                        ? target('sub')
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
    readonly rootFinal = viewChild('rootFinal', { read: ElementRef<HTMLElement> });
    readonly childFinal = viewChild('childFinal', { read: ElementRef<HTMLElement> });
    readonly targetMounted = signal(true);
    private readonly detachedTarget = signal<HTMLElement | null>(null);
    readonly rootPolicy = this.policy('main', this.settings.rootPolicy);
    readonly childPolicy = this.policy('sub', this.settings.childPolicy);
    constructor() {
        window.menuParity.finalFocusCalls = [];
    }
    private policy(layer: Layer, mode: string | undefined) {
        if (!mode) return undefined;
        if (mode === 'false') return false;
        if (mode === 'target' || mode === 'detached') return undefined;
        return (type: string | null) => {
            window.menuParity.finalFocusCalls!.push({ layer, type });
            if (mode === 'callback-null') return null;
            if (mode === 'callback-undefined') return undefined;
            return mode === 'callback-detached' ? this.target(layer) : this.liveTarget(layer);
        };
    }
    private liveTarget(layer: Layer): HTMLElement | null {
        return (layer === 'main' ? this.rootFinal() : this.childFinal())?.nativeElement ?? null;
    }
    target(layer: Layer): HTMLElement | null {
        return (this.settings.target?.layer === layer ? this.detachedTarget() : null) ?? this.liveTarget(layer);
    }
    private removeTarget(): void {
        this.detachedTarget.set(this.liveTarget(this.settings.target!.layer));
        this.targetMounted.set(false);
    }
    command(event: KeyboardEvent): void {
        if (!this.settings.target?.removal) return;
        if (event.key === 'F3') {
            event.preventDefault();
            this.removeTarget();
        } else if (event.key === 'F4') {
            event.preventDefault();
            this.detachedTarget.set(null);
            this.targetMounted.set(true);
        }
    }
    change(layer: Layer, change: RdxMenuOpenChange) {
        if (!change.open && this.settings.target?.removal === 'close' && this.settings.target.layer === layer)
            this.removeTarget();
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
