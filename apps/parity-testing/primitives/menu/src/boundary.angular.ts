import { afterNextRender, Component, ElementRef, signal, viewChild } from '@angular/core';
import { menuImports } from '@radix-ng/primitives/menu';
import type { RdxCollisionBoundary } from '@radix-ng/primitives/popper';
import { boundaryClasses } from './boundary';
import { classes, config, installProbe } from './contract';

@Component({
    selector: 'parity-menu',
    imports: [menuImports],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        @if (settings.positioning?.documentScroll) {
            <div class="h-[2000px]"></div>
        }
        <div
            #outer
            [class]="b.outer + (settings.positioning?.documentScroll ? ' absolute!' : '')"
            data-testid="boundary-outer"
        >
            <div
                #inner
                [class]="
                    b.inner +
                    (settings.absolute ? '' : ' transform-gpu') +
                    (settings.scaled ? ' origin-top-left scale-90' : '') +
                    (settings.positioning?.stickyTest ? ' overflow-auto!' : '')
                "
                data-testid="boundary-inner"
            >
                @if (settings.positioning?.stickyTest) {
                    <div class="h-[900px] w-[1200px]"></div>
                }
                @if (ready()) {
                    <div
                        [class]="b.anchor"
                        [modal]="!settings.positioning"
                        (onOpenChangeComplete)="trace.complete('main', $event)"
                        rdxMenuRoot
                    >
                        <button [class]="s.trigger" data-testid="primary" rdxMenuTrigger>Actions</button>
                        <ng-template [container]="settings.local ? inner : undefined" rdxMenuPortal>
                            <div
                                class="z-50"
                                [collisionBoundary]="boundary()"
                                [positionMethod]="method()"
                                [sticky]="sticky()"
                                align="start"
                                sideOffset="4"
                                data-testid="positioner"
                                rdxMenuPositioner
                            >
                                <div
                                    [class]="
                                        s.popup + (settings.positioning?.scaledPopup ? ' origin-top-left scale-90' : '')
                                    "
                                    data-testid="popup"
                                    rdxMenuPopup
                                >
                                    @if (settings.positioning?.arrow) {
                                        <span class="block h-[5px] w-2.5" data-testid="arrow" rdxMenuArrow></span>
                                    }
                                    <button [class]="s.item" data-testid="alpha" rdxMenuItem>Alpha</button>
                                    <button [class]="s.item" data-testid="bravo" rdxMenuItem>Bravo</button>
                                    <button [class]="s.item" data-testid="omega" rdxMenuItem>Omega</button>
                                </div>
                            </div>
                        </ng-template>
                    </div>
                }
            </div>
        </div>
    `
})
export class AngularBoundary {
    readonly s = classes;
    readonly b = boundaryClasses;
    readonly settings = config().boundary!;
    readonly trace = installProbe('angular');
    readonly ready = signal(false);
    readonly boundary = signal<RdxCollisionBoundary | undefined>(undefined);
    readonly method = signal<'absolute' | 'fixed' | undefined>(
        this.settings.positioning?.method ?? (this.settings.absolute ? 'absolute' : undefined)
    );
    readonly sticky = signal(this.settings.positioning?.sticky ?? false);
    readonly outer = viewChild.required<ElementRef<HTMLElement>>('outer');
    readonly inner = viewChild.required<ElementRef<HTMLElement>>('inner');

    constructor() {
        afterNextRender(() => {
            this.setBoundary(false);
            this.ready.set(true);
        });
    }

    command(event: KeyboardEvent) {
        if (event.key === 'F3' && this.settings.positioning) {
            event.preventDefault();
            if (this.settings.positioning.switchMethod) this.method.set('fixed');
            if (this.settings.positioning.toggleSticky) this.sticky.set(true);
        }
        if (this.settings.dynamic && event.key === 'F3') {
            event.preventDefault();
            this.setBoundary(true);
        }
    }

    private setBoundary(changed: boolean) {
        const inner = this.inner();
        const outer = this.outer();
        const element = changed ? outer.nativeElement : inner.nativeElement;
        const mode = this.settings.mode;
        const rect = element.getBoundingClientRect();
        this.boundary.set(
            mode === 'default'
                ? undefined
                : mode === 'clipping'
                  ? 'clipping-ancestors'
                  : mode === 'viewport'
                    ? []
                    : mode === 'ref'
                      ? inner
                      : mode === 'mixed'
                        ? [outer.nativeElement, inner]
                        : mode === 'array'
                          ? changed
                              ? [outer.nativeElement]
                              : [outer.nativeElement, inner.nativeElement]
                          : mode === 'rect'
                            ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
                            : element
        );
    }
}
