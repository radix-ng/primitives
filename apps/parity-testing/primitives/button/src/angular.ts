import '@angular/compiler';
import { Component, DestroyRef, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { classes, config, installProbe, type ButtonType } from './contract';
import { AngularInteraction } from './interaction.angular';

@Component({
    selector: 'parity-button',
    imports: [RdxButtonDirective],
    template: `
        <button type="button" tabindex="0" data-testid="before">Before</button>
        <form [class]="s.form" (submit)="trace.submit($event)" (reset)="trace.reset()">
            <input data-testid="field" name="field" value="initial" aria-label="Form field" />
            @switch (settings.host) {
                @case ('button') {
                    <button
                        [class]="s.button"
                        [disabled]="disabled()"
                        [focusableWhenDisabled]="focusable()"
                        [type]="type()"
                        (click)="trace.click($event)"
                        data-testid="subject"
                        rdxButton
                    >
                        Action
                    </button>
                }
                @case ('div') {
                    <!-- rdxButton supplies keyboard handling. -->
                    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
                    <div
                        [class]="s.button"
                        [disabled]="disabled()"
                        [focusableWhenDisabled]="focusable()"
                        (click)="trace.click($event)"
                        data-testid="subject"
                        rdxButton
                    >
                        Action
                        @if (settings.action === 'descendant') {
                            <span tabindex="0" data-testid="child">Child</span>
                        }
                    </div>
                }
                @case ('span') {
                    <!-- rdxButton supplies keyboard handling. -->
                    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
                    <span
                        [class]="s.button"
                        [disabled]="disabled()"
                        [focusableWhenDisabled]="focusable()"
                        (click)="trace.click($event)"
                        data-testid="subject"
                        rdxButton
                    >
                        Action
                    </span>
                }
                @case ('link') {
                    <a
                        [class]="s.button"
                        [disabled]="disabled()"
                        [focusableWhenDisabled]="focusable()"
                        (click)="trace.click($event)"
                        data-testid="subject"
                        href="#activated"
                        rdxButton
                    >
                        Action
                    </a>
                }
                @case ('anchor') {
                    <!-- rdxButton supplies keyboard handling. -->
                    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
                    <a
                        [class]="s.button"
                        [disabled]="disabled()"
                        [focusableWhenDisabled]="focusable()"
                        (click)="trace.click($event)"
                        data-testid="subject"
                        rdxButton
                    >
                        Action
                    </a>
                }
            }
        </form>
        <button type="button" tabindex="0" data-testid="after">After</button>
        <div class="h-[2400px]"></div>
    `
})
class AngularButton {
    readonly settings = config();
    readonly s = classes;
    readonly disabled = signal(this.settings.disabled ?? false);
    readonly focusable = signal(this.settings.focusableWhenDisabled ?? false);
    readonly type = signal<ButtonType>(this.settings.type ?? 'button');
    readonly trace = installProbe('angular', this.settings);
    constructor() {
        const listener = (event: KeyboardEvent) => {
            if (event.key === 'F6') {
                event.preventDefault();
                this.disabled.update((value) => !value);
            }
            if (event.key === 'F7') {
                event.preventDefault();
                this.focusable.update((value) => !value);
            }
            if (event.key === 'F8') {
                event.preventDefault();
                this.type.set('submit');
            }
        };
        document.addEventListener('keydown', listener);
        inject(DestroyRef).onDestroy(() => document.removeEventListener('keydown', listener));
    }
}
if (config().interaction)
    void bootstrapApplication(AngularInteraction, { providers: [provideZonelessChangeDetection()] });
else void bootstrapApplication(AngularButton, { providers: [provideZonelessChangeDetection()] });
