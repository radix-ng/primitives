import { Component, signal } from '@angular/core';
import { createRdxMenuHandle, RdxMenuModule, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { classes, config, installProbe } from './contract';
import { multiTriggerContent } from './triggers';

@Component({
    selector: 'parity-menu',
    imports: [RdxMenuModule],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            <input data-testid="before" aria-label="Before" />
            <input data-testid="outside" aria-label="Outside" />
            @if (p.detached) {
                <div class="flex gap-2">
                    @for (id of ids; track id) {
                        @if (id !== 'primary' || primaryPresent()) {
                            <button
                                [class]="s.trigger"
                                [id]="id"
                                [attr.data-testid]="id"
                                [handle]="handle"
                                [payload]="content()[id]"
                                [disabled]="p.disabled && id === 'secondary'"
                                rdxMenuTrigger
                            >
                                {{ content()[id].label }}
                            </button>
                        }
                    }
                </div>
            }
            @if (mounted()) {
                <ng-container
                    #root="rdxMenuRoot"
                    [(open)]="open"
                    [(triggerId)]="triggerId"
                    [handle]="handle"
                    [defaultOpen]="p.defaultOpen"
                    [defaultTriggerId]="p.defaultOpen ? 'secondary' : null"
                    [modal]="false"
                    (onOpenChange)="change($event)"
                    (onOpenChangeComplete)="trace.complete('main', $event)"
                    rdxMenuRoot
                >
                    @if (!p.detached) {
                        <div class="flex gap-2">
                            @for (id of ids; track id) {
                                <button
                                    [class]="s.trigger"
                                    [id]="id"
                                    [attr.data-testid]="id"
                                    [payload]="content()[id]"
                                    rdxMenuTrigger
                                >
                                    {{ content()[id].label }}
                                </button>
                            }
                        </div>
                    }
                    <output data-testid="active-payload">{{ root.payload()?.label ?? '' }}</output>
                    <ng-template [keepMounted]="p.retained" rdxMenuPortal>
                        <div class="z-50" data-testid="positioner" sideOffset="4" align="start" rdxMenuPositioner>
                            <div [class]="s.popup" data-testid="popup" rdxMenuPopup>
                                <div [class]="p.animated ? viewportClass : ''" data-testid="viewport" rdxMenuViewport>
                                    <div [class]="p.animated ? contentClass : ''">
                                        @for (item of root.payload()?.items; track item) {
                                            <button
                                                [class]="s.item"
                                                [attr.data-testid]="'action-' + $index"
                                                (onSelect)="trace.select(item)"
                                                rdxMenuItem
                                            >
                                                {{ item }}
                                            </button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                </ng-container>
            }
            <input data-testid="after" aria-label="After" />
        </div>
    `
})
export class AngularMultiTriggers {
    readonly s = classes;
    readonly settings = config();
    readonly p = this.settings.multiTrigger!;
    readonly handle = createRdxMenuHandle<{ label: string; items: string[] }>();
    readonly content = signal(multiTriggerContent);
    readonly ids = ['primary', 'secondary'] as const;
    readonly mounted = signal(true);
    readonly primaryPresent = signal(true);
    readonly open = signal(false);
    readonly triggerId = signal<string | null>(null);
    readonly trace = installProbe('angular');
    readonly viewportClass =
        'relative [&>[data-previous]]:absolute [&>[data-previous]]:inset-0 [&>[data-current]]:transition-opacity [&>[data-previous]]:transition-opacity [&>[data-current]]:duration-[60s] [&>[data-previous]]:duration-[60s] [&>[data-current][data-starting-style]]:opacity-0 [&>[data-previous][data-ending-style]]:opacity-0';
    readonly contentClass = '';
    command(event: KeyboardEvent): void {
        if (!['F3', 'F4', 'F6', 'F7', 'F8', 'F9', 'F10'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F3')
            this.content.update((data) => ({ ...data, primary: { label: 'Updated', items: ['Updated action'] } }));
        if (event.key === 'F4') {
            this.mounted.update((value) => !value);
            this.open.set(false);
            this.triggerId.set(null);
        }
        if (event.key === 'F6') this.handle.open('secondary');
        if (event.key === 'F7') this.handle.close();
        if (event.key === 'F8') {
            this.triggerId.set('secondary');
            this.open.set(true);
        }
        if (event.key === 'F9') this.triggerId.set('primary');
        if (event.key === 'F10') this.primaryPresent.set(false);
    }
    change(change: RdxMenuOpenChange): void {
        if (
            (this.p.cancelOpen && change.open) ||
            (this.p.cancelClose && !change.open) ||
            (this.p.cancelSwitch && change.open && this.open() && change.trigger?.id === 'secondary')
        )
            change.eventDetails.cancel();
        this.trace.change(
            'main',
            change.open,
            change.reason,
            change.eventDetails.isCanceled(),
            change.event,
            change.trigger
        );
    }
}
