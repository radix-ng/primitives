import '@angular/compiler';
import { Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxMenuModule,
    RdxMenuRoot,
    type RdxMenuCheckboxChangeEvent,
    type RdxMenuOpenChange,
    type RdxMenuRadioGroupValueChangeEvent
} from '@radix-ng/primitives/menu';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { exitClass } from '../../../shared/lifecycle';
import { changeCollection, menuEntries, submenuEntries } from '../../../shared/menu-collection';
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
                    [openOnHover]="settings.pointer.rootHover"
                    [delay]="settings.pointer.delay"
                    [closeDelay]="settings.pointer.closeDelay"
                    data-testid="primary"
                    rdxMenuTrigger
                >
                    Actions
                </button>
                <ng-template [keepMounted]="settings.lifecycle?.keepMounted ?? false" rdxMenuPortal>
                    <div
                        class="z-50"
                        [collisionPadding]="5"
                        align="start"
                        sideOffset="4"
                        data-testid="positioner"
                        rdxMenuPositioner
                    >
                        <div
                            [id]="settings.ids ? popupId() : undefined"
                            [class]="s.popup + (settings.lifecycle?.animated ? exitClass : '')"
                            data-testid="popup"
                            rdxMenuPopup
                        >
                            @for (item of items(); track item.id) {
                                <button
                                    [class]="s.item"
                                    [label]="item.id === 'alpha' ? settings.label : undefined"
                                    [disabled]="item.disabled"
                                    [attr.data-testid]="item.id"
                                    (onSelect)="trace.select(item.id)"
                                    rdxMenuItem
                                >
                                    {{ item.label }}
                                </button>
                            }
                            @if (!settings.collectionOnly) {
                                @if (settings.submenu && submenuPresent()) {
                                    <ng-container
                                        (onOpenChange)="change('sub', $event)"
                                        (onOpenChangeComplete)="trace.complete('sub', $event)"
                                        rdxMenuRoot
                                    >
                                        <button
                                            [class]="s.item"
                                            [disabled]="settings.pointer.disabledSubmenu"
                                            [delay]="settings.pointer.delay"
                                            [closeDelay]="settings.pointer.closeDelay"
                                            data-testid="more"
                                            rdxMenuSubTrigger
                                        >
                                            More
                                        </button>
                                        <ng-template rdxMenuPortal>
                                            <div
                                                class="z-50"
                                                [side]="settings.dir === 'rtl' ? 'left' : 'right'"
                                                [collisionPadding]="5"
                                                align="start"
                                                sideOffset="4"
                                                rdxMenuPositioner
                                            >
                                                <div
                                                    [class]="s.popup + (settings.lifecycle?.animated ? exitClass : '')"
                                                    data-testid="sub-popup"
                                                    rdxMenuPopup
                                                >
                                                    @for (item of subItems(); track item.id) {
                                                        <button
                                                            [class]="s.item"
                                                            [disabled]="item.disabled"
                                                            [attr.data-testid]="item.id"
                                                            (onSelect)="trace.select(item.id)"
                                                            rdxMenuItem
                                                        >
                                                            {{ item.label }}
                                                        </button>
                                                    }
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
                                <button
                                    [class]="s.item"
                                    (onSelect)="trace.select('omega')"
                                    data-testid="omega"
                                    rdxMenuItem
                                >
                                    Omega
                                </button>
                            }
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <input [class]="s.outside" aria-label="After menu" data-testid="after" />
        </div>
    `
})
class AngularMenu {
    readonly root = viewChild.required(RdxMenuRoot);
    readonly exitClass = exitClass;
    private closes = 0;
    private lateHold?: () => void;
    readonly settings = settings;
    readonly s = classes;
    readonly trace = installProbe('angular');
    readonly items = signal(menuEntries);
    readonly subItems = signal(submenuEntries);
    readonly submenuPresent = signal(true);
    readonly triggerId = signal('custom-trigger');
    readonly popupId = signal('custom-popup');
    command(event: KeyboardEvent) {
        if (['F3', 'F4'].includes(event.key) && settings.name.startsWith('collection-')) {
            event.preventDefault();
            if (settings.name === 'collection-submenu-unmount') this.submenuPresent.set(event.key === 'F4');
            else {
                const nested = settings.name.startsWith('collection-submenu');
                (nested ? this.subItems : this.items).update((items) =>
                    changeCollection(items, settings.name, {
                        id: nested ? 'sub-new' : 'new',
                        label: 'New',
                        disabled: false
                    })
                );
            }
        }
        if (['F8', 'F9', 'F10'].includes(event.key)) {
            event.preventDefault();
            if (event.key === 'F8') this.root().close();
            if (event.key === 'F9') this.root().unmount();
            if (event.key === 'F10') this.lateHold?.();
        }
        if (event.key !== 'F2') return;
        event.preventDefault();
        this.triggerId.set('renamed-trigger');
        this.popupId.set('renamed-popup');
    }
    outside(event: MouseEvent) {
        if ((event.target as Element)?.closest('[data-testid="outside"]')) this.trace.probe.activations++;
    }
    change(layer: Layer, change: RdxMenuOpenChange) {
        if (layer === 'main' && !change.open && ++this.closes === 1) {
            const lifecycle = settings.lifecycle;
            this.lateHold = change.eventDetails.preventUnmountOnClose;
            if (lifecycle?.deferred || lifecycle?.canceled) change.eventDetails.preventUnmountOnClose();
            if (lifecycle?.canceled) change.eventDetails.cancel();
        }
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
