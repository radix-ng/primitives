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
import { exitClass, heldExitClass } from '../../../shared/lifecycle';
import { changeCollection, menuEntries, submenuEntries } from '../../../shared/menu-collection';
import { rootRemovalFinalFocus } from '../../../shared/root-removal';
import { classes, config, installProbe, type Layer } from './contract';
import { AngularFocusBoundary } from './focus-boundary.angular';
import { AngularHosts } from './hosts.angular';
import { AngularProjection } from './projection.angular';
import { touchScrollEntries } from './touch';
import { AngularMultiTriggers } from './triggers.angular';

const settings = config();
@Component({
    selector: 'parity-menu',
    imports: [RdxMenuModule],
    host: { '(document:click)': 'outside($event)', '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout">
            @if (settings.touch) {
                <button [class]="s.outside" type="button" data-testid="outside">Background</button>
            } @else {
                <div [class]="s.outside" data-testid="outside">Background</div>
            }
            @if (beforePresent()) {
                <input [class]="s.outside" aria-label="Before menu" data-testid="before" />
            }
            @if (rootPresent()) {
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
                            [collisionPadding]="settings.touch?.wide ? 0 : 5"
                            align="start"
                            sideOffset="4"
                            data-testid="positioner"
                            rdxMenuPositioner
                        >
                            <div
                                [id]="settings.ids ? popupId() : undefined"
                                [class]="
                                    s.popup +
                                    (settings.lifecycle?.animated ? exitClass : '') +
                                    (settings.touch?.popupScroll ? ' max-h-40 overflow-y-auto' : '') +
                                    (settings.touch?.wide ? ' w-screen!' : '')
                                "
                                [finalFocus]="finalFocus"
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
                                                [delay]="settings.removal?.hoverPending ? 2000 : settings.pointer.delay"
                                                [closeDelay]="settings.pointer.closeDelay"
                                                data-testid="more"
                                                rdxMenuSubTrigger
                                            >
                                                More
                                            </button>
                                            <ng-template
                                                [keepMounted]="settings.empty?.retained ?? false"
                                                rdxMenuPortal
                                            >
                                                <div
                                                    class="z-50"
                                                    [side]="settings.dir === 'rtl' ? 'left' : 'right'"
                                                    [collisionPadding]="5"
                                                    align="start"
                                                    sideOffset="4"
                                                    rdxMenuPositioner
                                                >
                                                    <div
                                                        [class]="
                                                            s.popup + (settings.lifecycle?.animated ? exitClass : '')
                                                        "
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
                                            [disabled]="settings.name === 'touch-disabled-checkbox'"
                                            (onCheckedChange)="checked($event)"
                                            data-testid="check"
                                            rdxMenuCheckboxItem
                                        >
                                            Notifications
                                        </button>
                                    }
                                    @if (settings.radio) {
                                        <div (onValueChange)="radio($event)" defaultValue="one" rdxMenuRadioGroup>
                                            <button
                                                [class]="s.item"
                                                value="one"
                                                data-testid="radio-one"
                                                rdxMenuRadioItem
                                            >
                                                Small
                                            </button>
                                            <button
                                                [class]="s.item"
                                                [disabled]="settings.name === 'touch-disabled-radio'"
                                                value="two"
                                                data-testid="radio-two"
                                                rdxMenuRadioItem
                                            >
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
            }
            <input [class]="s.outside" aria-label="After menu" data-testid="after" />
        </div>
        @if (settings.removal || settings.touch?.pageScroll) {
            <div class="min-h-[2000px]"></div>
        }
    `
})
class AngularMenu {
    readonly root = viewChild.required(RdxMenuRoot);
    readonly exitClass =
        settings.removal?.animated || settings.lifecycle?.late || settings.name === 'lifecycle-submenu-css'
            ? heldExitClass
            : exitClass;
    readonly rootPresent = signal(true);
    readonly beforePresent = signal(true);
    readonly finalFocus = settings.removal?.finalFocus ? rootRemovalFinalFocus : undefined;
    private closes = 0;
    private lateHold?: () => void;
    readonly settings = settings;
    readonly s = classes;
    readonly trace = installProbe('angular');
    readonly items = signal(
        settings.touch?.popupScroll ? touchScrollEntries : settings.empty && !settings.empty.nested ? [] : menuEntries
    );
    readonly subItems = signal(settings.empty?.nested ? [] : submenuEntries);
    readonly submenuPresent = signal(true);
    readonly triggerId = signal('custom-trigger');
    readonly popupId = signal('custom-popup');
    command(event: KeyboardEvent) {
        if (settings.empty && ['F3', 'F4'].includes(event.key)) {
            event.preventDefault();
            if (settings.empty.nested) this.subItems.set(event.key === 'F3' ? submenuEntries : []);
            else this.items.set(event.key === 'F3' ? menuEntries : []);
            return;
        }
        if (settings.removal && ['F3', 'F4'].includes(event.key)) {
            event.preventDefault();
            this.rootPresent.set(event.key === 'F4');
            if (event.key === 'F3' && settings.removal.missingFocus) this.beforePresent.set(false);
            return;
        }
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
        if (
            (change.open && ['cancel-open', 'touch-cancel-open'].includes(settings.name)) ||
            (!change.open && ['cancel-close', 'touch-cancel-close'].includes(settings.name))
        )
            change.eventDetails.cancel();
        if (
            settings.name === 'hybrid-hover-touch-cancel' &&
            layer === 'main' &&
            change.open &&
            change.reason === 'trigger-press'
        )
            change.eventDetails.cancel();
        if (
            settings.name === 'hybrid-submenu-keyboard-touch-cancel' &&
            layer === 'sub' &&
            change.open &&
            change.reason === 'trigger-press'
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
    checked(change: RdxMenuCheckboxChangeEvent) {
        if (settings.name === 'checkbox-cancel') change.eventDetails.cancel();
        this.trace.value(change.checked as boolean, change.eventDetails.reason, change.eventDetails.isCanceled());
    }
    radio(change: RdxMenuRadioGroupValueChangeEvent) {
        if (settings.name === 'radio-cancel') change.eventDetails.cancel();
        this.trace.value(change.value as string, change.eventDetails.reason, change.eventDetails.isCanceled());
    }
}
void bootstrapApplication(
    settings.multiTrigger
        ? AngularMultiTriggers
        : settings.projection
          ? AngularProjection
          : settings.focusBoundary
            ? AngularFocusBoundary
            : settings.host
              ? AngularHosts
              : AngularMenu,
    {
        providers: [provideZonelessChangeDetection()]
    }
);
