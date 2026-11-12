import { Component, signal, viewChild } from '@angular/core';
import { RdxContextMenuModule, RdxContextMenuRoot } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { menuClasses } from '../../../shared/menu-fixture';
import { config, installProbe, type Layer } from './contract';
import { cancelIndependent } from './independent';

const settings = config();
const child = `
    @if (settings.independent?.submenu) {
        <ng-container (onOpenChange)="change('inner-sub', $event)"
            (onOpenChangeComplete)="trace.complete('inner-sub', $event)" rdxMenuRoot>
            <button [class]="s.item" data-testid="inner-more" rdxMenuSubTrigger>More</button>
            <ng-template rdxMenuPortal>
                <div class="z-50" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="s.popup" id="inner-sub-popup" data-testid="inner-sub-popup" data-menu-popup="inner-sub" rdxMenuPopup>
                        <button [class]="s.item" (onSelect)="trace.select('inner-sub-alpha')" data-testid="inner-sub-alpha" rdxMenuItem>Nested command</button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    }
`;
function popup(owner: 'inner' | 'outer', extra = '') {
    return `
    <ng-template [keepMounted]="settings.independent?.retained ?? false" rdxMenuPortal>
        <div class="z-50" side="right" align="start" sideOffset="4" rdxMenuPositioner>
            <div [class]="s.popup" id="${owner}-popup" data-testid="${owner}-popup" data-menu-popup="${owner}" rdxMenuPopup>
                <button [class]="s.item" (onSelect)="trace.select('${owner}-alpha')" data-testid="${owner}-alpha" rdxMenuItem>${owner} command</button>
                ${extra}
            </div>
        </div>
    </ng-template>`;
}
const inner = `
    @if (innerPresent()) {
        <ng-container [disabled]="settings.independent?.innerDisabled ?? false"
            (onOpenChange)="change('inner', $event)" (onOpenChangeComplete)="trace.complete('inner', $event)" rdxContextMenuRoot>
            <div [class]="s.trigger + ' block p-3'" tabindex="0" data-testid="inner-area" data-menu-trigger="inner" rdxContextMenuTrigger>Inner context area</div>
            ${popup('inner', child)}
        </ng-container>
    }
`;
const outerPopup = popup('outer', '@if (settings.independent?.popup) { ' + inner + ' }');

// Static fragments preserve the AOT-checked owning view and DI ancestry.
const template = `
        <div [class]="s.layout">
            <input [class]="s.outside" data-testid="before" aria-label="Before context menus" />
            <ng-container
                #outer="rdxContextMenuRoot"
                [disabled]="settings.independent?.outerDisabled ?? false"
                (onOpenChange)="change('outer', $event)"
                (onOpenChangeComplete)="trace.complete('outer', $event)"
                rdxContextMenuRoot
            >
                <div
                    [class]="s.trigger + ' grid gap-4 p-4'"
                    tabindex="0"
                    data-testid="area"
                    data-menu-trigger="outer"
                    rdxContextMenuTrigger
                >
                    Outer context area
                    @if (!settings.independent?.popup) {
                        ${inner}
                    }
                </div>
                ${outerPopup}
            </ng-container>
            <button
                [class]="s.outside + ' fixed start-24 top-[30rem]'"
                (click)="trace.probe.activations = trace.probe.activations + 1"
                type="button"
                data-testid="outside"
            >
                Outside
            </button>
        </div>
    `;

@Component({
    selector: 'parity-context-menu',
    imports: [RdxContextMenuModule, RdxMenuModule],
    host: { '(document:keydown)': 'command($event)' },
    template
})
export class AngularIndependentContextMenu {
    readonly settings = settings;
    readonly s = menuClasses;
    readonly trace = installProbe('angular');
    readonly outer = viewChild.required<RdxContextMenuRoot>('outer');
    readonly innerPresent = signal(true);
    readonly allow = signal(false);
    command(event: KeyboardEvent) {
        if (!['F3', 'F4', 'F5', 'F6'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F3' || event.key === 'F4') this.innerPresent.set(event.key === 'F4');
        if (event.key === 'F5') this.allow.set(true);
        if (event.key === 'F6') this.outer().close();
    }
    change(owner: Layer, change: RdxMenuOpenChange) {
        if (cancelIndependent(settings.name, owner, change.open, this.allow())) change.eventDetails.cancel();
        this.trace.change(
            owner,
            change.open,
            change.reason,
            change.eventDetails.isCanceled(),
            change.event,
            change.trigger
        );
    }
}
