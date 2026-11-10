import '@angular/compiler';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxMenuModule,
    type RdxMenuCheckboxChangeEvent,
    type RdxMenuOpenChange,
    type RdxMenuRadioGroupValueChangeEvent
} from '@radix-ng/primitives/menu';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { classes, config, installProbe, type Layer } from './contract';

const settings = config();
@Component({
    selector: 'parity-menu',
    imports: [RdxMenuModule],
    host: { '(document:click)': 'outside($event)', '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            <div [class]="s.outside" data-testid="outside">Background</div>
            <input [class]="s.outside" aria-label="Before menu" data-testid="before" />
            <ng-container
                [modal]="settings.modal"
                [dir]="settings.dir"
                [loopFocus]="settings.loop"
                [disabled]="settings.disabled"
                (onOpenChange)="change('main', $event)"
                (onOpenChangeComplete)="trace.complete('main', $event)"
                rdxMenuRoot
            >
                <button
                    [id]="settings.ids ? triggerId() : undefined"
                    [class]="s.trigger"
                    data-testid="primary"
                    rdxMenuTrigger
                >
                    Actions
                </button>
                <ng-template rdxMenuPortal>
                    <div class="z-50" [collisionPadding]="5" align="start" sideOffset="4" rdxMenuPositioner>
                        <div
                            [id]="settings.ids ? popupId() : undefined"
                            [class]="s.popup"
                            data-testid="popup"
                            rdxMenuPopup
                        >
                            <button
                                [class]="s.item"
                                [label]="settings.label"
                                (onSelect)="trace.select('alpha')"
                                data-testid="alpha"
                                rdxMenuItem
                            >
                                Alpha
                            </button>
                            <button
                                [class]="s.item"
                                [disabled]="true"
                                (onSelect)="trace.select('blocked')"
                                data-testid="blocked"
                                rdxMenuItem
                            >
                                Blocked
                            </button>
                            <button [class]="s.item" (onSelect)="trace.select('bravo')" data-testid="bravo" rdxMenuItem>
                                Bravo
                            </button>
                            @if (settings.submenu) {
                                <ng-container
                                    (onOpenChange)="change('sub', $event)"
                                    (onOpenChangeComplete)="trace.complete('sub', $event)"
                                    rdxMenuRoot
                                >
                                    <button [class]="s.item" data-testid="more" rdxMenuSubTrigger>More</button>
                                    <ng-template rdxMenuPortal>
                                        <div
                                            class="z-50"
                                            [side]="settings.dir === 'rtl' ? 'left' : 'right'"
                                            [collisionPadding]="5"
                                            align="start"
                                            sideOffset="4"
                                            rdxMenuPositioner
                                        >
                                            <div [class]="s.popup" data-testid="sub-popup" rdxMenuPopup>
                                                <button
                                                    [class]="s.item"
                                                    (onSelect)="trace.select('sub-alpha')"
                                                    data-testid="sub-alpha"
                                                    rdxMenuItem
                                                >
                                                    Archive
                                                </button>
                                                <button
                                                    [class]="s.item"
                                                    (onSelect)="trace.select('sub-bravo')"
                                                    data-testid="sub-bravo"
                                                    rdxMenuItem
                                                >
                                                    Browse
                                                </button>
                                            </div>
                                        </div>
                                    </ng-template>
                                </ng-container>
                            }
                            <button
                                [class]="s.item"
                                [closeOnClick]="false"
                                (onSelect)="trace.select('stay')"
                                data-testid="stay"
                                rdxMenuItem
                            >
                                Stay open
                            </button>
                            @if (settings.checkbox) {
                                <button
                                    [class]="s.item"
                                    (onCheckedChange)="checked($event)"
                                    data-testid="check"
                                    rdxMenuCheckboxItem
                                >
                                    Notifications
                                </button>
                            }
                            @if (settings.radio) {
                                <div (onValueChange)="radio($event)" defaultValue="one" rdxMenuRadioGroup>
                                    <button [class]="s.item" value="one" data-testid="radio-one" rdxMenuRadioItem>
                                        Small
                                    </button>
                                    <button [class]="s.item" value="two" data-testid="radio-two" rdxMenuRadioItem>
                                        Large
                                    </button>
                                </div>
                            }
                            <button [class]="s.item" (onSelect)="trace.select('omega')" data-testid="omega" rdxMenuItem>
                                Omega
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <input [class]="s.outside" aria-label="After menu" data-testid="after" />
        </div>
    `
})
class AngularMenu {
    readonly settings = settings;
    readonly s = classes;
    readonly trace = installProbe('angular');
    readonly triggerId = signal('custom-trigger');
    readonly popupId = signal('custom-popup');
    command(event: KeyboardEvent) {
        if (event.key !== 'F2') return;
        event.preventDefault();
        this.triggerId.set('renamed-trigger');
        this.popupId.set('renamed-popup');
    }
    outside(event: MouseEvent) {
        if ((event.target as Element)?.closest('[data-testid="outside"]')) this.trace.probe.activations++;
    }
    change(layer: Layer, change: RdxMenuOpenChange) {
        if ((change.open && settings.name === 'cancel-open') || (!change.open && settings.name === 'cancel-close'))
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
    checked(change: RdxMenuCheckboxChangeEvent) {
        if (settings.name === 'checkbox-cancel') change.eventDetails.cancel();
        this.trace.value(change.checked as boolean, change.eventDetails.reason, change.eventDetails.isCanceled());
    }
    radio(change: RdxMenuRadioGroupValueChangeEvent) {
        if (settings.name === 'radio-cancel') change.eventDetails.cancel();
        this.trace.value(change.value as string, change.eventDetails.reason, change.eventDetails.isCanceled());
    }
}
void bootstrapApplication(AngularMenu, { providers: [provideZonelessChangeDetection()] });
