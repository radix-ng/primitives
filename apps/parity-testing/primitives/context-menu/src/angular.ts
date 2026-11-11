import '@angular/compiler';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import { RdxMenuModule, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { createMenuPopupTemplate, menuClasses } from '../../../shared/menu-fixture';
import { cancelComposition } from './composition';
import { config, installProbe, type Layer } from './contract';
const settings = config();
const nested = `
    @if (settings.nested) {
        <ng-container (onOpenChange)="change('context-sub', $event)"
            (onOpenChangeComplete)="trace.complete('context-sub', $event)" rdxMenuRoot>
            <button [class]="s.item" data-testid="context-more" rdxMenuSubTrigger>More</button>
            <ng-template rdxMenuPortal>
                <div class="z-50" [side]="settings.dir === 'rtl' ? 'left' : 'right'"
                    align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="s.popup" id="context-sub-popup" data-testid="context-sub-popup" data-menu-popup="context-sub" rdxMenuPopup>
                        <button [class]="s.item" data-testid="context-sub-alpha" (onSelect)="trace.select('context-sub-alpha')" rdxMenuItem>Nested command</button>
                        <button [class]="s.item" data-testid="context-sub-bravo" (onSelect)="trace.select('context-sub-bravo')" rdxMenuItem>Last nested command</button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    }
`;
// Compose a static AOT template; the fragment keeps Menu parts in this owning view.
const template = `
        <div [dir]="settings.dir" rdxDirectionProvider>
        <div [class]="s.layout">
            <input [class]="s.outside" data-testid="before" aria-label="Before context menu" />
            @for (menu of menus; track menu) {
                <ng-container
                    [disabled]="settings.disabled"
                    (onOpenChange)="change('context', $event)"
                    (onOpenChangeComplete)="trace.complete('context', $event)"
                    rdxContextMenuRoot
                >
                    @if (settings.nestedAreas) {
                        <div id="context-trigger" [class]="s.trigger + ' grid gap-4 p-4'" tabindex="0"
                            data-testid="area" data-menu-trigger="context" rdxContextMenuTrigger>
                            Outer context area
                            <div id="context-trigger-two" [class]="s.trigger" tabindex="0"
                                data-testid="area-two" data-menu-trigger="context" rdxContextMenuTrigger>Inner context area</div>
                        </div>
                    } @else {
                    <button
                        id="context-trigger"
                        [class]="s.trigger + (settings.name.startsWith('touch-') ? ' touch-none' : '')"
                        type="button"
                        data-testid="area"
                        data-menu-trigger="context"
                        rdxContextMenuTrigger
                    >
                        Context area
                    </button>
                    @if (settings.multiple) {
                        <button id="context-trigger-two" [class]="s.trigger + ' ms-80'" type="button"
                            data-testid="area-two" data-menu-trigger="context" rdxContextMenuTrigger>Second context area</button>
                    }
                    }
                    ${createMenuPopupTemplate(nested)}
                </ng-container>
            }
            <button
                [class]="s.outside + ' fixed start-24 top-[30rem]'"
                (click)="trace.probe.activations = trace.probe.activations + 1"
                type="button"
                data-testid="outside"
            >
                Outside
            </button>
        </div>
        </div>
`;
@Component({
    selector: 'parity-context-menu',
    imports: [RdxContextMenuModule, RdxMenuModule, RdxDirectionProvider],
    host: { '(document:keydown)': 'command($event)' },
    template
})
class AngularContextMenu {
    readonly menus = ['context'];
    readonly s = menuClasses;
    readonly settings = settings;
    readonly trace = installProbe('angular');
    readonly allow = signal(false);
    command(event: KeyboardEvent) {
        if (event.key === 'F5') {
            event.preventDefault();
            this.allow.set(true);
        }
    }
    change(layer: Layer, change: RdxMenuOpenChange) {
        if (
            (change.open && settings.name === 'cancel-open') ||
            (!change.open && settings.name === 'cancel-close') ||
            (!this.allow() && cancelComposition(settings.name, layer, change.open, change.reason))
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
}
void bootstrapApplication(AngularContextMenu, { providers: [provideZonelessChangeDetection()] });
