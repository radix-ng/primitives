import { Component, signal } from '@angular/core';
import { createRdxMenuHandle, RdxMenuModule, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { installProbe, classes as s } from './contract';
import { handleOwners, type HandleOwner } from './handle-overlap';

@Component({
    selector: 'parity-menu',
    imports: [RdxMenuModule],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            <input data-testid="before" aria-label="Before" />
            @for (version of [triggerVersion()]; track version) {
                <button
                    id="primary"
                    [class]="s.trigger"
                    [handle]="handle"
                    [payload]="label()"
                    data-testid="primary"
                    rdxMenuTrigger
                >
                    {{ label() }}
                </button>
            }
            @for (owner of owners(); track owner.id) {
                <ng-container
                    #root="rdxMenuRoot"
                    [handle]="owner.id === 'newer' && rebound() ? otherHandle : handle"
                    [modal]="false"
                    (onOpenChange)="change(owner, $event)"
                    (onOpenChangeComplete)="trace.complete(owner.layer, $event)"
                    rdxMenuRoot
                >
                    <output [attr.data-testid]="owner.id + '-payload'">{{ root.payload() ?? '' }}</output>
                    <ng-template rdxMenuPortal>
                        <div class="z-50" align="start" sideOffset="4" rdxMenuPositioner>
                            <div [class]="s.popup" [attr.data-testid]="owner.popup" rdxMenuPopup>
                                <button
                                    [class]="s.item"
                                    [attr.data-testid]="owner.id + '-action'"
                                    (onSelect)="trace.select(owner.id)"
                                    rdxMenuItem
                                >
                                    {{ root.payload() }} action
                                </button>
                            </div>
                        </div>
                    </ng-template>
                </ng-container>
            }
            <input data-testid="after" aria-label="After" />
        </div>
    `
})
export class AngularHandleOverlap {
    readonly s = s;
    readonly handle = createRdxMenuHandle<string>();
    readonly otherHandle = createRdxMenuHandle<string>();
    readonly owners = signal<readonly HandleOwner[]>(handleOwners.slice(0, 1));
    readonly rebound = signal(false);
    readonly label = signal('Alpha');
    readonly triggerVersion = signal(0);
    readonly trace = installProbe('angular');
    constructor() {
        this.trace.probe.handleOpen = () => this.handle.isOpen();
    }
    command(event: KeyboardEvent) {
        if (!['F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F2') this.rebound.update((value) => !value);
        if (event.key === 'F3') this.label.set('Updated');
        if (event.key === 'F4')
            this.owners.update((owners) => (owners.length === 2 ? owners.slice(0, 1) : handleOwners));
        if (event.key === 'F5') this.owners.set(handleOwners.slice(1));
        if (event.key === 'F6') this.handle.open('primary');
        if (event.key === 'F7') this.handle.close();
        if (event.key === 'F8') this.owners.set([]);
        if (event.key === 'F9') this.owners.set(handleOwners.slice(0, 1));
        if (event.key === 'F10') this.triggerVersion.update((version) => version + 1);
    }
    change(owner: HandleOwner, change: RdxMenuOpenChange) {
        this.trace.change(
            owner.layer,
            change.open,
            change.reason,
            change.eventDetails.isCanceled(),
            change.event,
            change.trigger
        );
    }
}
