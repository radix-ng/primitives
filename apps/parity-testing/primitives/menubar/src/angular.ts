import '@angular/compiler';
import { Component, Directive, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import { RdxMenuModule, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { changeCollection, type MenuEntry } from '../../../shared/menu-collection';
import { menuClasses, menuPopupTemplate } from '../../../shared/menu-fixture';
import { config, installProbe, type Layer } from './contract';
const settings = config();
// A consumer can compose Menubar without authoring the original selector attribute.
@Directive({
    selector: '[parityMenubar]',
    hostDirectives: [{ directive: RdxMenubarRoot, inputs: ['disabled'] }]
})
class MenubarHost {}
// Compose a static AOT template; the fragment keeps Menu parts in this owning view.
const template = `
        <div [dir]="settings.dir" rdxDirectionProvider>
            <div [class]="s.layout + ' w-96!'">
                <input [class]="s.outside" data-testid="before" aria-label="Before menubar" />
                <div class="flex gap-2" [disabled]="settings.disabled" aria-label="Application" parityMenubar>
                    @for (entry of menus(); track entry.id) {
                        @let menu = entry.id;
                        <ng-container
                            [disabled]="entry.disabled"
                            (onOpenChange)="change(menu, $event)"
                            (onOpenChangeComplete)="trace.complete(menu, $event)"
                            rdxMenuRoot
                        >
                            <button
                                [id]="menu + '-trigger'"
                                [attr.data-testid]="menu + '-trigger'"
                                [attr.data-menu-trigger]="menu"
                                [class]="s.trigger"
                                rdxMenuTrigger
                            >
                                {{ entry.label }}
                            </button>
                            ${menuPopupTemplate}
                        </ng-container>
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
    imports: [RdxMenuModule, MenubarHost, RdxDirectionProvider],
    host: { '(document:keydown)': 'command($event)' },
    template
})
class AngularMenubar {
    readonly s = menuClasses;
    readonly menus = signal<MenuEntry<Layer>[]>([
        { id: 'file', label: 'file', disabled: false },
        { id: 'blocked', label: 'blocked', disabled: true },
        { id: 'edit', label: 'edit', disabled: false }
    ]);
    command(event: KeyboardEvent) {
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
        if ((change.open && settings.name === 'cancel-open') || (!change.open && settings.name === 'cancel-close'))
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
