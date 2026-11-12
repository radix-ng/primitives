import { Component, input, output, signal } from '@angular/core';
import {
    RdxMenuCheckboxItem,
    RdxMenuItem,
    RdxMenuLinkItem,
    RdxMenuModule,
    RdxMenuRadioGroup,
    RdxMenuRadioItem,
    RdxMenuRoot,
    RdxMenuSubTrigger,
    RdxMenuTrigger,
    type RdxMenuOpenChange,
    type RdxMenuRadioGroupValueChangeEvent
} from '@radix-ng/primitives/menu';
import { classes, config, installProbe, type Layer } from './contract';
import { projectionEntries } from './projection';

@Component({
    selector: 'projection-menu-root',
    template: '<ng-content />',
    hostDirectives: [
        { directive: RdxMenuRoot, inputs: ['modal', 'dir'], outputs: ['onOpenChange', 'onOpenChangeComplete'] }
    ],
    host: { class: 'contents' }
})
export class ProjectionRoot {}

@Component({ selector: 'button[projectionTrigger]', template: '<ng-content />', hostDirectives: [RdxMenuTrigger] })
export class ProjectionTrigger {}

@Component({
    selector: 'button[projectionItem]',
    template: '<ng-content />',
    hostDirectives: [{ directive: RdxMenuItem, inputs: ['disabled', 'label', 'closeOnClick'], outputs: ['onSelect'] }]
})
export class ProjectionItem {}

@Component({
    selector: 'a[projectionLink]',
    template: '<ng-content />',
    hostDirectives: [{ directive: RdxMenuLinkItem, inputs: ['closeOnClick'], outputs: ['onSelect'] }]
})
export class ProjectionLink {}

@Component({
    selector: 'button[projectionSubTrigger]',
    template: '<ng-content />',
    hostDirectives: [RdxMenuSubTrigger]
})
export class ProjectionSubTrigger {}

@Component({
    selector: 'button[projectionCheckbox]',
    template: '<ng-content />',
    hostDirectives: [{ directive: RdxMenuCheckboxItem, outputs: ['onCheckedChange'] }]
})
export class ProjectionCheckbox {}

@Component({
    selector: 'div[projectionRadioGroup]',
    template: '<ng-content />',
    hostDirectives: [{ directive: RdxMenuRadioGroup, inputs: ['defaultValue'], outputs: ['onValueChange'] }]
})
export class ProjectionRadioGroup {}

@Component({
    selector: 'button[projectionRadio]',
    template: '<ng-content />',
    hostDirectives: [{ directive: RdxMenuRadioItem, inputs: ['value'] }]
})
export class ProjectionRadio {}

@Component({
    selector: 'projection-menu-popup',
    imports: [RdxMenuModule],
    template: `
        <ng-template [keepMounted]="retained()" rdxMenuPortal>
            <div
                class="z-50"
                [side]="layer() === 'main' ? 'bottom' : dir() === 'rtl' ? 'left' : 'right'"
                [attr.data-testid]="layer() === 'main' ? 'positioner' : 'sub-positioner'"
                align="start"
                sideOffset="4"
                rdxMenuPositioner
            >
                <div
                    [class]="s.popup"
                    [finalFocus]="finalFocus()"
                    [attr.data-testid]="layer() === 'main' ? 'popup' : 'sub-popup'"
                    rdxMenuPopup
                >
                    @if (mixed()) {
                        <button [class]="s.item" (onSelect)="onInnerSelect.emit()" data-testid="inner" rdxMenuItem>
                            Internal
                        </button>
                    }
                    <ng-content />
                </div>
            </div>
        </ng-template>
    `
})
export class ProjectionPopup {
    readonly s = classes;
    readonly layer = input<Layer>('main');
    readonly dir = input<'ltr' | 'rtl'>('ltr');
    readonly retained = input(false);
    readonly mixed = input(false);
    readonly finalFocus = input<HTMLElement>();
    readonly onInnerSelect = output<void>();
}

@Component({
    selector: 'parity-menu',
    imports: [
        ProjectionRoot,
        ProjectionTrigger,
        ProjectionPopup,
        ProjectionItem,
        ProjectionLink,
        ProjectionSubTrigger,
        ProjectionCheckbox,
        ProjectionRadioGroup,
        ProjectionRadio
    ],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            <input #finalTarget data-testid="root-final" aria-label="Return target" />
            <input data-testid="before" aria-label="Before menu" />
            <projection-menu-root
                [modal]="!p.cancelFocus"
                [dir]="settings.dir"
                (onOpenChange)="change('main', $event)"
                (onOpenChangeComplete)="trace.complete('main', $event)"
            >
                <button [class]="s.trigger" data-testid="primary" projectionTrigger>Actions</button>
                <projection-menu-popup
                    [retained]="p.retained"
                    [mixed]="p.mixed"
                    [finalFocus]="p.finalTarget ? finalTarget : undefined"
                    (onInnerSelect)="trace.select('inner')"
                >
                    @for (item of items(); track item.id) {
                        <button
                            [class]="s.item"
                            [disabled]="item.disabled"
                            [label]="
                                settings.name === 'projection-typeahead' && item.id === 'alpha' ? 'Zebra' : undefined
                            "
                            [attr.data-testid]="item.id"
                            (onSelect)="trace.select(item.id)"
                            projectionItem
                        >
                            {{ item.label }}
                        </button>
                    }
                    @if (p.link) {
                        <a
                            [class]="s.item"
                            [closeOnClick]="true"
                            (onSelect)="trace.select('link')"
                            href="#projection-target"
                            data-testid="link"
                            projectionLink
                        >
                            Visit target
                        </a>
                    }
                    @if (p.nested) {
                        <projection-menu-root
                            (onOpenChange)="change('sub', $event)"
                            (onOpenChangeComplete)="trace.complete('sub', $event)"
                        >
                            <button [class]="s.item" data-testid="more" projectionSubTrigger>More</button>
                            <projection-menu-popup [dir]="settings.dir" [retained]="p.retained" layer="sub">
                                <button
                                    [class]="s.item"
                                    (onSelect)="trace.select('sub-alpha')"
                                    data-testid="sub-alpha"
                                    projectionItem
                                >
                                    Child action
                                </button>
                            </projection-menu-popup>
                        </projection-menu-root>
                    }
                    @if (p.values) {
                        <button
                            [class]="s.item"
                            (onCheckedChange)="
                                trace.value(
                                    $event.checked === true,
                                    $event.eventDetails.reason,
                                    $event.eventDetails.isCanceled()
                                )
                            "
                            data-testid="check"
                            projectionCheckbox
                        >
                            Notifications
                        </button>
                        <div (onValueChange)="radio($event)" defaultValue="one" projectionRadioGroup>
                            <button [class]="s.item" value="one" data-testid="radio-one" projectionRadio>Small</button>
                            <button [class]="s.item" value="two" data-testid="radio-two" projectionRadio>Large</button>
                        </div>
                    }
                    <button [class]="s.item" (onSelect)="trace.select('omega')" data-testid="omega" projectionItem>
                        Omega
                    </button>
                </projection-menu-popup>
            </projection-menu-root>
            <input data-testid="after" aria-label="After menu" />
        </div>
    `
})
export class AngularProjection {
    readonly s = classes;
    readonly settings = config();
    readonly p = this.settings.projection!;
    readonly trace = installProbe('angular');
    readonly items = signal(this.p.late ? [] : projectionEntries);
    radio(change: RdxMenuRadioGroupValueChangeEvent) {
        this.trace.value(change.value as string, change.eventDetails.reason, change.eventDetails.isCanceled());
    }
    command(event: KeyboardEvent) {
        if (event.key !== 'F3') return;
        event.preventDefault();
        this.items.set(this.p.late ? projectionEntries : [...projectionEntries].reverse());
    }
    change(layer: Layer, change: RdxMenuOpenChange) {
        if (this.p.cancelFocus && !change.open && change.reason === 'focus-out') change.eventDetails.cancel();
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
