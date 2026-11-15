import { Component, ElementRef, signal } from '@angular/core';
import { menuImports, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import type { RdxPortalContainer } from '@radix-ng/primitives/portal';
import { classes, config, installProbe } from './contract';

@Component({
    selector: 'parity-menu',
    imports: [menuImports],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            <button [class]="s.outside" data-testid="outside">Background</button>
            @if (exists()) {
                <div
                    (onOpenChange)="change($event)"
                    (onOpenChangeComplete)="trace.complete('main', $event)"
                    rdxMenuRoot
                >
                    <button [class]="s.trigger" data-testid="primary" rdxMenuTrigger>Actions</button>
                    <ng-template [container]="target()" [keepMounted]="p.retained" rdxMenuPortal>
                        <div class="z-50" data-testid="positioner" rdxMenuPositioner>
                            <div [class]="s.popup" data-testid="popup" rdxMenuPopup>
                                <button
                                    [class]="s.item"
                                    (click)="trace.select('alpha')"
                                    data-testid="alpha"
                                    rdxMenuItem
                                >
                                    Alpha
                                </button>
                                <button
                                    [class]="s.item"
                                    (click)="trace.select('bravo')"
                                    data-testid="bravo"
                                    rdxMenuItem
                                >
                                    Bravo
                                </button>
                            </div>
                        </div>
                    </ng-template>
                </div>
            }
        </div>
    `
})
export class AngularPortals {
    readonly p = config().portal!;
    readonly s = classes;
    readonly surface = window.menuPortalSurface;
    readonly trace = installProbe('angular', this.surface.document);
    readonly target = signal<RdxPortalContainer>(
        this.p.ref ? new ElementRef(this.surface.target) : this.surface.target
    );
    readonly exists = signal(true);
    command(event: KeyboardEvent) {
        if (event.key === 'F3') {
            event.preventDefault();
            this.target.set(this.surface.alternate);
        }
        if (event.key === 'F4') {
            event.preventDefault();
            this.exists.set(false);
        }
    }
    change(change: RdxMenuOpenChange) {
        const e = change.eventDetails;
        this.trace.change('main', change.open, e.reason, e.isCanceled(), e.event, e.trigger);
    }
}
