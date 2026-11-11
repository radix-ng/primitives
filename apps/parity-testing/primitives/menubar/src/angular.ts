import '@angular/compiler';
import { Component, Directive, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import {
    RdxMenuItem,
    RdxMenuModule,
    RdxMenuPopup,
    RdxMenuSubTrigger,
    type RdxMenuOpenChange
} from '@radix-ng/primitives/menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { changeCollection, type MenuEntry } from '../../../shared/menu-collection';
import { createMenuPopupTemplate } from '../../../shared/menu-fixture';
import { cancelChange } from './composition';
import { config, initialMenus, installProbe, submenuId, type Layer, type TopLayer } from './contract';
import { menubarClasses } from './orientation';
import { changeExternalOpen, initialOpenState } from './state';
const settings = config();
// A consumer can compose Menubar without authoring the original selector attribute.
@Directive({
    selector: '[parityMenubar]',
    hostDirectives: [{ directive: RdxMenubarRoot, inputs: ['disabled', 'orientation'] }]
})
class MenubarHost {}
@Directive({ selector: '[parityPopup]', hostDirectives: [RdxMenuPopup] })
class PopupHost {}
@Directive({
    selector: '[parityItem]',
    hostDirectives: [{ directive: RdxMenuItem, inputs: ['disabled'], outputs: ['onSelect'] }]
})
class ItemHost {}
@Directive({ selector: '[paritySubTrigger]', hostDirectives: [RdxMenuSubTrigger] })
class SubTriggerHost {}
function createNestedTemplate(
    popupAttribute = 'rdxMenuPopup',
    itemAttribute = 'rdxMenuItem',
    subTriggerAttribute = 'rdxMenuSubTrigger'
) {
    return `
    @if (settings.nested) {
        <ng-container [orientation]="settings.childOrientation" (onOpenChange)="change(submenuId(menu), $event)"
            (onOpenChangeComplete)="trace.complete(submenuId(menu), $event)" rdxMenuRoot>
            <button [class]="s.item" [attr.data-testid]="menu + '-more'" ${subTriggerAttribute}>More</button>
            <ng-template [keepMounted]="settings.keepMounted" rdxMenuPortal>
                <div class="z-50" [side]="settings.dir === 'rtl' ? 'left' : 'right'" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="s.childPopup" [id]="menu + '-sub-popup'" [attr.data-testid]="menu + '-sub-popup'"
                        [attr.data-menu-popup]="menu + '-sub'" ${popupAttribute}>
                        <button [class]="s.item" [attr.data-testid]="menu + '-sub-alpha'"
                            (onSelect)="trace.select(menu + '-sub-alpha')" ${itemAttribute}>Nested command</button>
                        @if (settings.orientationCase) {
                            <button [class]="s.item" [attr.data-testid]="menu + '-sub-blocked'" [disabled]="true"
                                ${itemAttribute}>Blocked nested command</button>
                            <button [class]="s.item" [attr.data-testid]="menu + '-sub-bravo'"
                                (onSelect)="trace.select(menu + '-sub-bravo')" ${itemAttribute}>Last nested command</button>
                        }
                    </div>
                </div>
            </ng-template>
        </ng-container>
    }
`;
}
// Both variants remain static AOT templates in the owning Menu view.
const nestedTemplate = createNestedTemplate();
const composedNestedTemplate = createNestedTemplate('parityPopup', 'parityItem', 'paritySubTrigger');
function createRootTemplate(bindings: string) {
    return `
        <ng-container [disabled]="entry.disabled" [orientation]="settings.popupOrientation" ${bindings}
            (onOpenChange)="change(menu, $event)"
            (onOpenChangeComplete)="trace.complete(menu, $event)" rdxMenuRoot>
            <button [id]="menu + '-trigger'" [attr.data-testid]="menu + '-trigger'"
                [attr.data-menu-trigger]="menu" [class]="s.trigger" rdxMenuTrigger>{{ entry.label }}</button>
            @if (settings.composed) {
                ${createMenuPopupTemplate(composedNestedTemplate, 'parityPopup', 'parityItem')}
            } @else {
                ${createMenuPopupTemplate(nestedTemplate)}
            }
        </ng-container>
    `;
}
// Compose a static AOT template; the fragment keeps Menu parts in this owning view.
const template = `
        <div [dir]="settings.dir" rdxDirectionProvider>
            <div [class]="s.layout + ' w-96!'">
                <input [class]="s.outside" data-testid="before" aria-label="Before menubar" />
                <div [class]="settings.orientation === 'vertical' ? 'flex flex-col gap-2' : 'flex gap-2'"
                    [orientation]="settings.orientation" [disabled]="settings.disabled" aria-label="Application" parityMenubar>
                    @for (entry of menus(); track entry.id) {
                        @let menu = entry.id;
                        @if (settings.controlled) {
                            ${createRootTemplate('[open]="open()[menu]" (openChange)="setOpen(menu, $event)"')}
                        } @else {
                            ${createRootTemplate('[defaultOpen]="settings.defaultOpen && menu === \'file\'"')}
                        }
                    }
                </div>
                <button
                    [class]="s.outside + ' fixed start-24 top-[30rem]'"
                    (click)="trace.probe.activations = trace.probe.activations + 1"
                    data-testid="outside"
                    type="button"
                >
                    Outside
                </button>
            </div>
        </div>
`;
@Component({
    selector: 'parity-menubar',
    imports: [RdxMenuModule, MenubarHost, PopupHost, ItemHost, SubTriggerHost, RdxDirectionProvider],
    host: { '(document:keydown)': 'command($event)' },
    template
})
class AngularMenubar {
    readonly s = menubarClasses(settings);
    readonly submenuId = submenuId;
    readonly allowSwitch = signal(false);
    readonly menus = signal<MenuEntry<TopLayer>[]>(initialMenus(settings.name));
    readonly open = signal(initialOpenState(settings.name));
    setOpen(menu: TopLayer, open: boolean) {
        this.open.update((state) => ({ ...state, [menu]: open }));
    }
    command(event: KeyboardEvent) {
        if (settings.controlled && ['F6', 'F7', 'F8'].includes(event.key)) {
            event.preventDefault();
            this.open.update((state) => changeExternalOpen(state, event.key));
        }
        if (event.key === 'F5') {
            event.preventDefault();
            this.allowSwitch.set(true);
        }
        if (event.key === 'F3' && settings.name.startsWith('collection-')) {
            event.preventDefault();
            this.menus.update((items) =>
                changeCollection(
                    items,
                    settings.name,
                    { id: 'new', label: 'new', disabled: false },
                    settings.name === 'collection-disable' ? 'edit' : undefined
                )
            );
        }
    }
    readonly settings = settings;
    readonly trace = installProbe('angular');
    change(menu: Layer, change: RdxMenuOpenChange) {
        if (cancelChange(settings.name, menu, change.open, change.reason, this.allowSwitch()))
            change.eventDetails.cancel();
        this.trace.change(
            menu,
            change.open,
            change.reason,
            change.eventDetails.isCanceled(),
            change.event,
            change.trigger
        );
    }
}
void bootstrapApplication(AngularMenubar, { providers: [provideZonelessChangeDetection()] });
