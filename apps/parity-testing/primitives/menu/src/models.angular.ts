import { Component, inject, signal } from '@angular/core';
import { menuImports, type RdxMenuOpenChange, type RdxMenuRadioGroupValueChangeEvent } from '@radix-ng/primitives/menu';
import { classes, config, installProbe, type Layer } from './contract';

@Component({
    selector: 'model-radio-items',
    imports: [menuImports],
    template: `
        <button [class]="s.item" value="one" data-testid="radio-one" rdxMenuRadioItem>One</button>
        <button [class]="s.item" value="two" data-testid="radio-two" rdxMenuRadioItem>Two</button>
    `
})
class RadioItems {
    readonly s = classes;
}

@Component({
    selector: 'model-popup',
    imports: [menuImports, RadioItems],
    template: `
        <ng-template rdxMenuPortal>
            <div class="z-50" rdxMenuPositioner>
                <div [class]="s.popup" data-testid="popup" rdxMenuPopup>
                    @if (app.p.radio) {
                        @if (app.p.explicitRadio) {
                            <div
                                [(value)]="app.value"
                                [defaultValue]="app.defaultValue()"
                                (onValueChange)="app.changedValue($event)"
                                rdxMenuRadioGroup
                            >
                                <model-radio-items />
                            </div>
                        } @else {
                            <div
                                [defaultValue]="app.defaultValue()"
                                (onValueChange)="app.changedValue($event)"
                                rdxMenuRadioGroup
                            >
                                <model-radio-items />
                            </div>
                        }
                    } @else {
                        <button [class]="s.item" data-testid="alpha" rdxMenuItem>Alpha</button>
                    }
                    @if (app.p.nested) {
                        <div
                            [(open)]="app.subOpen"
                            [defaultOpen]="true"
                            (onOpenChange)="app.change('sub', $event)"
                            (onOpenChangeComplete)="app.trace.complete('sub', $event)"
                            rdxMenuRoot
                        >
                            <button [class]="s.item" data-testid="more" rdxMenuSubTrigger>More</button>
                            <ng-template rdxMenuPortal>
                                <div class="z-50" rdxMenuPositioner>
                                    <div [class]="s.popup" data-testid="sub-popup" rdxMenuPopup>
                                        <button [class]="s.item" data-testid="sub-alpha" rdxMenuItem>Child</button>
                                    </div>
                                </div>
                            </ng-template>
                        </div>
                    }
                </div>
            </div>
        </ng-template>
    `
})
class ModelPopup {
    readonly app = inject(AngularModels);
    readonly s = classes;
}

@Component({
    selector: 'parity-menu',
    imports: [menuImports, ModelPopup],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            @if (p.explicitOpen) {
                <div
                    [(open)]="open"
                    [defaultOpen]="defaultOpen()"
                    (onOpenChange)="change('main', $event)"
                    (onOpenChangeComplete)="trace.complete('main', $event)"
                    rdxMenuRoot
                >
                    <button [class]="s.trigger" data-testid="primary" rdxMenuTrigger>Actions</button>
                    <model-popup />
                </div>
            } @else {
                <div
                    [defaultOpen]="defaultOpen()"
                    (onOpenChange)="change('main', $event)"
                    (onOpenChangeComplete)="trace.complete('main', $event)"
                    rdxMenuRoot
                >
                    <button [class]="s.trigger" data-testid="primary" rdxMenuTrigger>Actions</button>
                    <model-popup />
                </div>
            }
        </div>
    `
})
export class AngularModels {
    readonly s = classes;
    readonly p = config().models!;
    readonly trace = installProbe('angular');
    readonly open = signal(this.p.open);
    readonly subOpen = signal(false);
    readonly defaultOpen = signal(this.p.defaultOpen);
    readonly value = signal<unknown>(this.p.value);
    readonly defaultValue = signal<string | undefined>(this.p.defaultValue);
    command(event: KeyboardEvent) {
        if (event.key !== 'F3') return;
        event.preventDefault();
        this.defaultOpen.update((value) => !value);
        this.defaultValue.update((value) => (value === 'one' ? 'two' : 'one'));
    }
    change(layer: Layer, change: RdxMenuOpenChange) {
        const e = change.eventDetails;
        this.trace.change(layer, change.open, e.reason, e.isCanceled(), e.event, e.trigger);
    }
    changedValue(change: RdxMenuRadioGroupValueChangeEvent) {
        this.trace.value(change.value as string, change.eventDetails.reason, change.eventDetails.isCanceled());
    }
}
