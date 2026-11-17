import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { RdxMenuRoot, RdxMenuTrigger } from '@radix-ng/primitives/menu';
import { RdxToolbarButton, RdxToolbarGroup, RdxToolbarRoot } from '@radix-ng/primitives/toolbar';
import { classes, config, installProbe } from './contract';

@Component({
    selector: 'parity-button',
    imports: [
        RdxButtonDirective,
        RdxCompositeItem,
        RdxCompositeRoot,
        RdxToolbarRoot,
        RdxToolbarGroup,
        RdxToolbarButton,
        RdxMenuRoot,
        RdxMenuTrigger
    ],
    template: `
        <button type="button" tabindex="0" data-testid="before">Before</button>
        <form [class]="s.form" (submit)="trace.submit($event)">
            <input data-testid="field" value="initial" aria-label="Form field" />
            @switch (p.scope) {
                @case ('standalone') {
                    @switch (settings.host) {
                        @case ('button') {
                            <button
                                [class]="s.button"
                                [disabled]="disabled()"
                                [focusableWhenDisabled]="focusable"
                                (pointerdown)="pointer($event)"
                                (mousedown)="pointer($event)"
                                (keydown)="consume($event)"
                                (keyup)="consume($event)"
                                (click)="trace.click($event)"
                                rdxButton
                                data-testid="subject"
                            >
                                Action
                            </button>
                        }
                        @case ('link') {
                            <a
                                [class]="s.button"
                                [disabled]="disabled()"
                                [focusableWhenDisabled]="focusable"
                                (pointerdown)="pointer($event)"
                                (mousedown)="pointer($event)"
                                (keydown)="consume($event)"
                                (keyup)="consume($event)"
                                (click)="trace.click($event)"
                                rdxButton
                                data-testid="subject"
                                href="#activated"
                            >
                                Action
                            </a>
                        }
                        @default {
                            <span
                                [class]="s.button"
                                [disabled]="disabled()"
                                [focusableWhenDisabled]="focusable"
                                (pointerdown)="pointer($event)"
                                (mousedown)="pointer($event)"
                                (keydown)="consume($event)"
                                (keyup)="consume($event)"
                                (click)="trace.click($event)"
                                rdxButton
                                data-testid="subject"
                            >
                                Action
                            </span>
                        }
                    }
                }
                @case ('composite') {
                    <div
                        [disabledIndices]="disabled() && !focusable ? [1] : []"
                        rdxCompositeRoot
                        data-testid="collection"
                    >
                        <button type="button" data-testid="first" data-item rdxCompositeItem>First</button>
                        @switch (settings.host) {
                            @case ('button') {
                                <button
                                    [class]="s.button"
                                    [disabled]="p.disabledOwner ? false : disabled()"
                                    [focusableWhenDisabled]="focusable"
                                    (pointerdown)="pointer($event)"
                                    (mousedown)="pointer($event)"
                                    (keydown)="consume($event)"
                                    (keyup)="consume($event)"
                                    (click)="trace.click($event)"
                                    rdxCompositeItem
                                    rdxButton
                                    data-testid="subject"
                                    data-item
                                >
                                    Action
                                </button>
                            }
                            @case ('link') {
                                <a
                                    [class]="s.button"
                                    [disabled]="p.disabledOwner ? false : disabled()"
                                    [focusableWhenDisabled]="focusable"
                                    (pointerdown)="pointer($event)"
                                    (mousedown)="pointer($event)"
                                    (keydown)="consume($event)"
                                    (keyup)="consume($event)"
                                    (click)="trace.click($event)"
                                    rdxCompositeItem
                                    rdxButton
                                    data-testid="subject"
                                    data-item
                                    href="#activated"
                                >
                                    Action
                                </a>
                            }
                            @default {
                                <span
                                    [class]="s.button"
                                    [disabled]="p.disabledOwner ? false : disabled()"
                                    [focusableWhenDisabled]="focusable"
                                    (pointerdown)="pointer($event)"
                                    (mousedown)="pointer($event)"
                                    (keydown)="consume($event)"
                                    (keyup)="consume($event)"
                                    (click)="trace.click($event)"
                                    rdxCompositeItem
                                    rdxButton
                                    data-testid="subject"
                                    data-item
                                >
                                    Action
                                </span>
                            }
                        }
                        <button type="button" data-testid="last" data-item rdxCompositeItem>Last</button>
                    </div>
                }
                @case ('toolbar') {
                    <div
                        [disabled]="p.disabledOwner === 'root' && disabled()"
                        rdxToolbarRoot
                        data-testid="collection"
                        aria-label="Actions"
                    >
                        <button data-testid="first" data-item rdxToolbarButton>First</button>
                        <div [disabled]="p.disabledOwner === 'group' && disabled()" rdxToolbarGroup>
                            @if (p.menu) {
                                <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
                                    @if (settings.host === 'button') {
                                        <button
                                            [class]="s.button"
                                            rdxToolbarButton
                                            rdxMenuTrigger
                                            data-testid="subject"
                                            data-item
                                        >
                                            Action
                                        </button>
                                    } @else {
                                        <span
                                            [class]="s.button"
                                            [nativeButton]="false"
                                            rdxToolbarButton
                                            rdxMenuTrigger
                                            data-testid="subject"
                                            data-item
                                        >
                                            Action
                                        </span>
                                    }
                                    <output data-testid="menu-open">{{ menu.open() }}</output>
                                </ng-container>
                            } @else if (p.bare) {
                                @switch (settings.host) {
                                    @case ('button') {
                                        <button
                                            [class]="s.button"
                                            [nativeButton]="true"
                                            [disabled]="p.disabledOwner ? false : disabled()"
                                            [focusableWhenDisabled]="focusable"
                                            (pointerdown)="pointer($event)"
                                            (mousedown)="pointer($event)"
                                            (keydown)="consume($event)"
                                            (keyup)="consume($event)"
                                            (click)="trace.click($event)"
                                            rdxToolbarButton
                                            data-testid="subject"
                                            data-item
                                        >
                                            Action
                                        </button>
                                    }
                                    @case ('link') {
                                        <a
                                            [class]="s.button"
                                            [nativeButton]="false"
                                            [disabled]="p.disabledOwner ? false : disabled()"
                                            [focusableWhenDisabled]="focusable"
                                            (pointerdown)="pointer($event)"
                                            (mousedown)="pointer($event)"
                                            (keydown)="consume($event)"
                                            (keyup)="consume($event)"
                                            (click)="trace.click($event)"
                                            rdxToolbarButton
                                            data-testid="subject"
                                            data-item
                                            href="#activated"
                                        >
                                            Action
                                        </a>
                                    }
                                    @case ('span') {
                                        <span
                                            [class]="s.button"
                                            [nativeButton]="false"
                                            [disabled]="p.disabledOwner ? false : disabled()"
                                            [focusableWhenDisabled]="focusable"
                                            (pointerdown)="pointer($event)"
                                            (mousedown)="pointer($event)"
                                            (keydown)="consume($event)"
                                            (keyup)="consume($event)"
                                            (click)="trace.click($event)"
                                            rdxToolbarButton
                                            data-testid="subject"
                                            data-item
                                        >
                                            Action
                                        </span>
                                    }
                                }
                            } @else {
                                @switch (settings.host) {
                                    @case ('button') {
                                        <button
                                            [class]="s.button"
                                            [disabled]="p.disabledOwner ? false : disabled()"
                                            [focusableWhenDisabled]="focusable"
                                            (pointerdown)="pointer($event)"
                                            (mousedown)="pointer($event)"
                                            (keydown)="consume($event)"
                                            (keyup)="consume($event)"
                                            (click)="trace.click($event)"
                                            rdxToolbarButton
                                            rdxButton
                                            data-testid="subject"
                                            data-item
                                        >
                                            Action
                                        </button>
                                    }
                                    @case ('link') {
                                        <a
                                            [class]="s.button"
                                            [nativeButton]="false"
                                            [disabled]="p.disabledOwner ? false : disabled()"
                                            [focusableWhenDisabled]="focusable"
                                            (pointerdown)="pointer($event)"
                                            (mousedown)="pointer($event)"
                                            (keydown)="consume($event)"
                                            (keyup)="consume($event)"
                                            (click)="trace.click($event)"
                                            rdxToolbarButton
                                            rdxButton
                                            data-testid="subject"
                                            data-item
                                            href="#activated"
                                        >
                                            Action
                                        </a>
                                    }
                                    @default {
                                        <span
                                            [class]="s.button"
                                            [nativeButton]="false"
                                            [disabled]="p.disabledOwner ? false : disabled()"
                                            [focusableWhenDisabled]="focusable"
                                            (pointerdown)="pointer($event)"
                                            (mousedown)="pointer($event)"
                                            (keydown)="consume($event)"
                                            (keyup)="consume($event)"
                                            (click)="trace.click($event)"
                                            rdxToolbarButton
                                            rdxButton
                                            data-testid="subject"
                                            data-item
                                        >
                                            Action
                                        </span>
                                    }
                                }
                            }
                        </div>
                        <button data-testid="last" data-item rdxToolbarButton>Last</button>
                    </div>
                }
            }
        </form>
        <button type="button" tabindex="0" data-testid="after">After</button>
        <div class="h-[2400px]"></div>
    `
})
export class AngularInteraction {
    readonly settings = config();
    readonly p = this.settings.interaction!;
    readonly s = classes;
    readonly focusable = this.settings.focusableWhenDisabled ?? false;
    readonly disabled = signal(!!this.settings.disabled || !!this.p.disabledOwner);
    readonly trace = installProbe('angular', this.settings);
    constructor() {
        const host = inject(ElementRef<HTMLElement>).nativeElement;
        const destroyRef = inject(DestroyRef);
        const command = (event: KeyboardEvent) => {
            if (!this.p.disabledHandlers || event.key !== 'F6') return;
            event.preventDefault();
            this.disabled.update((value) => !value);
        };
        document.addEventListener('keydown', command, true);
        destroyRef.onDestroy(() => document.removeEventListener('keydown', command, true));
        afterNextRender(() => {
            if (this.p.listener !== 'native') return;
            const subject = host.querySelector('[data-testid="subject"]')!;
            const consume = (event: Event) => this.trace.consume(event as KeyboardEvent);
            subject.addEventListener('keydown', consume);
            subject.addEventListener('keyup', consume);
            destroyRef.onDestroy(() => {
                subject.removeEventListener('keydown', consume);
                subject.removeEventListener('keyup', consume);
            });
        });
    }
    pointer(event: MouseEvent) {
        if (this.p.disabledHandlers) this.trace.probe.handlers.push(event.type);
    }
    consume(event: KeyboardEvent) {
        if (this.p.listener !== 'native') this.trace.consume(event);
    }
}
