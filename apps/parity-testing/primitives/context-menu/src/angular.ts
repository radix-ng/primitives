import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { menuClasses, menuPopupTemplate } from '../../../shared/menu-fixture';
import { config, installProbe } from './contract';
const settings = config();
// Compose a static AOT template; the fragment keeps Menu parts in this owning view.
const template = `
        <div [class]="s.layout">
            <input [class]="s.outside" data-testid="before" aria-label="Before context menu" />
            @for (menu of menus; track menu) {
                <ng-container
                    [disabled]="settings.disabled"
                    (onOpenChange)="change($event)"
                    (onOpenChangeComplete)="trace.complete('context', $event)"
                    rdxContextMenuRoot
                >
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
                    ${menuPopupTemplate}
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
`;
@Component({ selector: 'parity-context-menu', imports: [RdxContextMenuModule, RdxMenuModule], template })
class AngularContextMenu {
    readonly menus = ['context'];
    readonly s = menuClasses;
    readonly settings = settings;
    readonly trace = installProbe('angular');
    change(change: RdxMenuOpenChange) {
        if ((change.open && settings.name === 'cancel-open') || (!change.open && settings.name === 'cancel-close'))
            change.eventDetails.cancel();
        this.trace.change(
            'context',
            change.open,
            change.reason,
            change.eventDetails.isCanceled(),
            change.event,
            change.trigger
        );
    }
}
void bootstrapApplication(AngularContextMenu, { providers: [provideZonelessChangeDetection()] });
