import { afterNextRender, Component, DestroyRef, ElementRef, inject } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';
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
        RdxToolbarButton
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
                                (keydown)="consume($event)"
                                (keyup)="consume($event)"
                                (click)="trace.click($event)"
                                rdxButton
                                data-testid="subject"
                                tabindex="0"
                            >
                                Action
                            </span>
                        }
                    }
                }
                @case ('composite') {
                    <div [disabledIndices]="skipped" rdxCompositeRoot data-testid="collection">
                        <button type="button" data-testid="first" data-item rdxCompositeItem>First</button>
                        @switch (settings.host) {
                            @case ('button') {
                                <button
                                    [class]="s.button"
                                    [disabled]="!!settings.disabled"
                                    [focusableWhenDisabled]="focusable"
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
                                    [disabled]="!!settings.disabled"
                                    [focusableWhenDisabled]="focusable"
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
                                    [disabled]="!!settings.disabled"
                                    [focusableWhenDisabled]="focusable"
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
                        [disabled]="p.disabledOwner === 'root'"
                        rdxToolbarRoot
                        data-testid="collection"
                        aria-label="Actions"
                    >
                        <button data-testid="first" data-item rdxToolbarButton>First</button>
                        <div [disabled]="p.disabledOwner === 'group'" rdxToolbarGroup>
                            @switch (settings.host) {
                                @case ('button') {
                                    <button
                                        [class]="s.button"
                                        [disabled]="!!settings.disabled"
                                        [focusableWhenDisabled]="focusable"
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
                                        [disabled]="!!settings.disabled"
                                        [focusableWhenDisabled]="focusable"
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
                                        [disabled]="!!settings.disabled"
                                        [focusableWhenDisabled]="focusable"
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
    readonly skipped = this.settings.disabled && !this.focusable ? [1] : [];
    readonly trace = installProbe('angular', this.settings);
    constructor() {
        const host = inject(ElementRef<HTMLElement>).nativeElement;
        const destroyRef = inject(DestroyRef);
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
    consume(event: KeyboardEvent) {
        if (this.p.listener !== 'native') this.trace.consume(event);
    }
}
