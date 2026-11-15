import { Component, inject, signal } from '@angular/core';
import { menuImports, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { classes, config, installProbe } from './contract';

@Component({
    selector: 'parity-label-items',
    imports: [menuImports],
    template: `
        @if (app.primary()) {
            <div [id]="app.id()" data-testid="label" rdxMenuGroupLabel>Planets</div>
        }
        @if (app.secondary()) {
            <div id="secondary-label" data-testid="secondary-label" rdxMenuGroupLabel>Alternative</div>
        }
        @if (app.p.radio) {
            <button [class]="s.item" value="mars" data-testid="alpha" rdxMenuRadioItem>Mars</button>
        } @else {
            <button [class]="s.item" data-testid="alpha" rdxMenuItem>Mars</button>
        }
    `
})
class LabelItems {
    readonly app = inject(AngularLabels);
    readonly s = classes;
}

@Component({
    selector: 'parity-menu',
    imports: [menuImports, LabelItems],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            <div (onOpenChange)="change($event)" (onOpenChangeComplete)="trace.complete('main', $event)" rdxMenuRoot>
                <button [class]="s.trigger" data-testid="primary" rdxMenuTrigger>Actions</button>
                <div class="z-50" *rdxMenuPortal rdxMenuPositioner>
                    <div [class]="s.popup" data-testid="popup" rdxMenuPopup>
                        @if (p.radio) {
                            <div data-testid="group" rdxMenuRadioGroup><parity-label-items /></div>
                        } @else {
                            <div data-testid="group" rdxMenuGroup><parity-label-items /></div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AngularLabels {
    readonly p = config().labels!;
    readonly s = classes;
    readonly trace = installProbe('angular');
    readonly id = signal<string | undefined>(this.p.generated ? undefined : 'custom-label');
    readonly primary = signal(true);
    readonly secondary = signal(false);
    command(event: KeyboardEvent) {
        if (event.key === 'F3') this.id.update((id) => (id === 'renamed-label' ? undefined : 'renamed-label'));
        else if (event.key === 'F4') this.primary.update((show) => !show);
        else if (event.key === 'F6') this.secondary.update((show) => !show);
        else return;
        event.preventDefault();
    }
    change(change: RdxMenuOpenChange) {
        const e = change.eventDetails;
        this.trace.change('main', change.open, e.reason, e.isCanceled(), e.event, e.trigger);
    }
}
