import { Component, inject, signal } from '@angular/core';
import { RdxContextMenuRoot, RdxContextMenuTrigger } from '@radix-ng/primitives/context-menu';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import { menuImports } from '@radix-ng/primitives/menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';
import { classes, config, installProbe } from './contract';

const settings = config();
const p = settings.placement!;

@Component({
    selector: 'placement-popup',
    imports: [menuImports],
    template: `
        <ng-template [keepMounted]="p.switchOrientation" rdxMenuPortal>
            <div
                class="z-50"
                [side]="p.side"
                [align]="p.align"
                [sideOffset]="p.offset"
                [alignOffset]="p.offset"
                data-testid="positioner"
                rdxMenuPositioner
            >
                <div [class]="s.popup + (p.fallback ? ' w-[600px]!' : '')" data-testid="popup" rdxMenuPopup>
                    <button [class]="s.item" data-testid="alpha" rdxMenuItem>Alpha</button>
                    @if (p.nested) {
                        <ng-container (onOpenChangeComplete)="trace.complete('sub', $event)" rdxMenuRoot>
                            <button [class]="s.item" data-testid="more" rdxMenuSubTrigger>More</button>
                            <ng-template rdxMenuPortal>
                                <div
                                    class="z-50"
                                    [side]="p.override ? 'top' : undefined"
                                    [align]="p.override ? 'end' : undefined"
                                    [sideOffset]="p.override ? 9 : undefined"
                                    [alignOffset]="p.override ? 3 : undefined"
                                    data-testid="sub-positioner"
                                    rdxMenuPositioner
                                >
                                    <div [class]="s.popup" data-testid="sub-popup" rdxMenuPopup>
                                        <button [class]="s.item" data-testid="sub-alpha" rdxMenuItem>Child</button>
                                    </div>
                                </div>
                            </ng-template>
                        </ng-container>
                    }
                </div>
            </div>
        </ng-template>
    `
})
class PlacementPopup {
    readonly p = p;
    readonly s = classes;
    readonly trace = inject(AngularPlacement).trace;
}

@Component({
    selector: 'parity-menu',
    imports: [
        menuImports,
        RdxMenubarRoot,
        RdxContextMenuRoot,
        RdxContextMenuTrigger,
        RdxDirectionProvider,
        PlacementPopup
    ],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="s.layout" [dir]="dir" [attr.dir]="dir" rdxDirectionProvider>
            @if (p.kind === 'context') {
                <div (onOpenChangeComplete)="trace.complete('main', $event)" rdxContextMenuRoot>
                    <button [class]="s.trigger + ' w-28'" data-testid="primary" rdxContextMenuTrigger>Actions</button>
                    <placement-popup />
                </div>
            } @else if (p.kind === 'bar') {
                <div [orientation]="orientation()" rdxMenubarRoot>
                    <ng-container (onOpenChangeComplete)="trace.complete('main', $event)" rdxMenuRoot>
                        <button [class]="s.trigger + ' w-28'" data-testid="primary" rdxMenuTrigger>Actions</button>
                        <placement-popup />
                    </ng-container>
                </div>
            } @else {
                <ng-container (onOpenChangeComplete)="trace.complete('main', $event)" rdxMenuRoot>
                    <button [class]="s.trigger + ' w-28'" data-testid="primary" rdxMenuTrigger>Actions</button>
                    <placement-popup />
                </ng-container>
            }
        </div>
    `
})
export class AngularPlacement {
    readonly s = classes;
    readonly p = p;
    readonly trace = installProbe('angular');
    readonly dir = settings.dir;
    readonly orientation = signal<'horizontal' | 'vertical'>(p.vertical ? 'vertical' : 'horizontal');
    command(event: KeyboardEvent) {
        if (p.switchOrientation && event.key === 'F3') {
            event.preventDefault();
            this.orientation.update((value) => (value === 'horizontal' ? 'vertical' : 'horizontal'));
        }
    }
}
