import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { popoverImports } from '@radix-ng/primitives/popover';
import { RdxPortal, type RdxPortalContainer } from '@radix-ng/primitives/portal';
import { _importsSelect } from '@radix-ng/primitives/select';
import { classes } from './contract';

/** Angular-only consumer regressions; the independent family audits are not certified by Menu. */
@Component({
    selector: 'parity-menu',
    imports: [dialogImports, popoverImports, _importsSelect, RdxPortal],
    template: `
        <div [class]="s.layout">
            @switch (family) {
                @case ('portal') {
                    @if (shown()) {
                        <div data-testid="origin">
                            <div [container]="target()" data-testid="transfer-node" rdxPortal>
                                <input
                                    [value]="text()"
                                    (input)="text.set($any($event.target).value)"
                                    (keydown)="command($event)"
                                    aria-label="Portal input"
                                    data-testid="transfer-input"
                                />
                                <button (click)="clicks.update(increment)" data-testid="transfer-button">
                                    Increment
                                </button>
                            </div>
                        </div>
                    }
                    <div #returnTarget data-testid="return-target"></div>
                    <output data-testid="state">{{ text() }}:{{ clicks() }}</output>
                }
                @case ('popover') {
                    <div rdxPopoverRoot>
                        <button [class]="s.trigger" data-testid="primary" rdxPopoverTrigger>Open</button>
                        <ng-template [container]="target()" rdxPopoverPortal>
                            <div class="z-50" data-testid="positioner" rdxPopoverPositioner>
                                <div [class]="s.popup" data-testid="popup" rdxPopoverPopup>
                                    <input aria-label="Popover input" data-testid="input" />
                                    <button data-testid="close" rdxPopoverClose>Close</button>
                                </div>
                            </div>
                        </ng-template>
                    </div>
                }
                @case ('dialog') {
                    <div rdxDialogRoot>
                        <button [class]="s.trigger" data-testid="primary" rdxDialogTrigger>Open</button>
                        <ng-template [container]="target()" rdxDialogPortal>
                            <div class="fixed inset-0 z-40 bg-black/20" rdxDialogBackdrop></div>
                            <div [class]="s.popup + ' fixed top-40 left-24 z-50'" data-testid="popup" rdxDialogPopup>
                                <h2 rdxDialogTitle>Portal dialog</h2>
                                <input aria-label="Dialog input" data-testid="input" />
                                <button data-testid="close" rdxDialogClose>Close</button>
                            </div>
                        </ng-template>
                    </div>
                }
                @case ('select') {
                    <div rdxSelectRoot>
                        <button [class]="s.trigger" data-testid="primary" rdxSelectTrigger>
                            <span #selected="rdxSelectedValue" rdxSelectValue placeholder="Choose">
                                {{ selected.slotText() }}
                            </span>
                        </button>
                        <ng-template [container]="target()" rdxSelectPortal>
                            <div class="z-50" data-testid="positioner" rdxSelectPositioner>
                                <div [class]="s.popup" data-testid="popup" rdxSelectPopup>
                                    <div rdxSelectList>
                                        <div [class]="s.item" value="One" data-testid="option-one" rdxSelectItem>
                                            <span rdxSelectItemText>One</span>
                                        </div>
                                        <div [class]="s.item" value="Two" data-testid="option-two" rdxSelectItem>
                                            <span rdxSelectItemText>Two</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ng-template>
                    </div>
                }
            }
        </div>
    `
})
export class AngularPortalConsumers {
    readonly family = new URLSearchParams(location.search).get('consumer');
    readonly surface = window.menuPortalSurface;
    readonly s = classes;
    readonly target = signal<RdxPortalContainer>(this.surface.target);
    readonly shown = signal(true);
    readonly text = signal('Initial');
    readonly clicks = signal(0);
    readonly increment = (value: number) => value + 1;
    readonly returnTarget = viewChild<ElementRef<HTMLElement>>('returnTarget');
    command(event: KeyboardEvent) {
        if (event.key === 'F3') {
            event.preventDefault();
            this.target.update((target) =>
                target === this.surface.target ? this.returnTarget()!.nativeElement : this.surface.target
            );
        }
        if (event.key === 'F4') {
            event.preventDefault();
            this.shown.set(false);
        }
    }
}
