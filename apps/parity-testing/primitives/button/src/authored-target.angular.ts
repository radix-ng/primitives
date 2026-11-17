import { Component, input } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { RdxToolbarButton } from '@radix-ng/primitives/toolbar';
import type { AuthoredState } from './authored';
import { classes, config } from './contract';

@Component({
    selector: 'parity-authored-target',
    imports: [RdxButtonDirective, RdxCompositeItem, RdxToolbarButton],
    template: `
        @switch (p.scope) {
            @case ('standalone') {
                @if (p.binding === 'static') {
                    @switch (settings.host) {
                        @case ('button') {
                            <button
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                role="menuitem"
                                tabindex="-1"
                            >
                                Action
                            </button>
                        }
                        @case ('span') {
                            <span
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                role="menuitem"
                                tabindex="-1"
                            >
                                Action
                            </span>
                        }
                        @case ('link') {
                            <a
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                href="#activated"
                                role="menuitem"
                                tabindex="-1"
                            >
                                Action
                            </a>
                        }
                    }
                } @else {
                    @switch (settings.host) {
                        @case ('button') {
                            <button
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [role]="state().role()"
                                [tabIndex]="state().tabIndex()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                            >
                                Action
                            </button>
                        }
                        @case ('span') {
                            <span
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [role]="state().role()"
                                [tabIndex]="state().tabIndex()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                            >
                                Action
                            </span>
                        }
                        @case ('link') {
                            <a
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [role]="state().role()"
                                [tabIndex]="state().tabIndex()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                href="#activated"
                            >
                                Action
                            </a>
                        }
                    }
                }
            }
            @case ('composite') {
                @if (p.binding === 'static') {
                    @switch (settings.host) {
                        @case ('button') {
                            <button
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxCompositeItem
                                data-item
                                role="menuitem"
                                tabindex="-1"
                            >
                                Action
                            </button>
                        }
                        @case ('span') {
                            <span
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxCompositeItem
                                data-item
                                role="menuitem"
                                tabindex="-1"
                            >
                                Action
                            </span>
                        }
                        @case ('link') {
                            <a
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxCompositeItem
                                data-item
                                href="#activated"
                                role="menuitem"
                                tabindex="-1"
                            >
                                Action
                            </a>
                        }
                    }
                } @else {
                    @switch (settings.host) {
                        @case ('button') {
                            <button
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [role]="state().role()"
                                [tabIndex]="state().tabIndex()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxCompositeItem
                                data-item
                            >
                                Action
                            </button>
                        }
                        @case ('span') {
                            <span
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [role]="state().role()"
                                [tabIndex]="state().tabIndex()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxCompositeItem
                                data-item
                            >
                                Action
                            </span>
                        }
                        @case ('link') {
                            <a
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [role]="state().role()"
                                [tabIndex]="state().tabIndex()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxCompositeItem
                                data-item
                                href="#activated"
                            >
                                Action
                            </a>
                        }
                    }
                }
            }
            @case ('toolbar') {
                @if (p.binding === 'static') {
                    @switch (settings.host) {
                        @case ('button') {
                            <button
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxToolbarButton
                                data-item
                                role="menuitem"
                                tabindex="-1"
                            >
                                Action
                            </button>
                        }
                        @case ('span') {
                            <span
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [nativeButton]="false"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxToolbarButton
                                data-item
                                role="menuitem"
                                tabindex="-1"
                            >
                                Action
                            </span>
                        }
                        @case ('link') {
                            <a
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [nativeButton]="false"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxToolbarButton
                                data-item
                                href="#activated"
                                role="menuitem"
                                tabindex="-1"
                            >
                                Action
                            </a>
                        }
                    }
                } @else {
                    @switch (settings.host) {
                        @case ('button') {
                            <button
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [role]="state().role()"
                                [tabIndex]="state().tabIndex()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxToolbarButton
                                data-item
                            >
                                Action
                            </button>
                        }
                        @case ('span') {
                            <span
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [nativeButton]="false"
                                [role]="state().role()"
                                [tabIndex]="state().tabIndex()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxToolbarButton
                                data-item
                            >
                                Action
                            </span>
                        }
                        @case ('link') {
                            <a
                                [class]="s.button"
                                [disabled]="state().disabled()"
                                [focusableWhenDisabled]="state().focusable()"
                                [nativeButton]="false"
                                [role]="state().role()"
                                [tabIndex]="state().tabIndex()"
                                (keydown)="key($event)"
                                (click)="trace().click($event)"
                                rdxButton
                                data-testid="subject"
                                rdxToolbarButton
                                data-item
                                href="#activated"
                            >
                                Action
                            </a>
                        }
                    }
                }
            }
        }
    `
})
export class AngularAuthoredTarget {
    readonly state = input.required<AuthoredState>();
    readonly settings = config();
    readonly p = this.settings.authored!;
    readonly s = classes;
    readonly trace = input.required<{ click(event: MouseEvent): void }>();
    key(event: KeyboardEvent) {
        if (this.p.action === 'role-space' && event.key === ' ') event.preventDefault();
    }
}
