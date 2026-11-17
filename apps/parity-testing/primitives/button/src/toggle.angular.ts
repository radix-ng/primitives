import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import { RdxToggle, RdxTogglePressedChangeEvent } from '@radix-ng/primitives/toggle';
import { RdxToolbarButton, RdxToolbarGroup, RdxToolbarRoot } from '@radix-ng/primitives/toolbar';
import { classes, config, installProbe } from './contract';
import type { ToggleChange } from './toggle';

@Component({
    selector: 'parity-button',
    imports: [RdxToggle, RdxButtonDirective, RdxToolbarRoot, RdxToolbarButton, RdxToolbarGroup],
    template: `
        <button type="button" tabindex="0" data-testid="before">Before</button>
        <form [class]="s.form" (submit)="trace.submit($event)">
            <input data-testid="field" value="initial" aria-label="Form field" />
            <div
                [disabled]="p.disabledOwner === 'root' && disabled()"
                rdxToolbarRoot
                data-testid="collection"
                aria-label="Formatting"
            >
                <button rdxToolbarButton data-testid="first" data-item>First</button>
                <div [disabled]="p.disabledOwner === 'group' && disabled()" rdxToolbarGroup>
                    @if (p.stacked) {
                        @if (settings.host === 'button') {
                            <button
                                [class]="s.button"
                                [disabled]="p.disabledOwner === 'self' && disabled()"
                                [focusableWhenDisabled]="focusable()"
                                (onPressedChange)="change($event)"
                                (keydown)="consume($event)"
                                (click)="trace.click($event)"
                                rdxToolbarButton
                                rdxToggle
                                rdxButton
                                data-testid="subject"
                                data-item
                            >
                                Bold
                            </button>
                        } @else {
                            <!-- The composed directives supply focus and roving tabindex. -->
                            <span
                                [nativeButton]="false"
                                [class]="s.button"
                                [disabled]="p.disabledOwner === 'self' && disabled()"
                                [focusableWhenDisabled]="focusable()"
                                (onPressedChange)="change($event)"
                                (keydown)="consume($event)"
                                (click)="trace.click($event)"
                                rdxToolbarButton
                                rdxToggle
                                rdxButton
                                data-testid="subject"
                                data-item
                            >
                                Bold
                            </span>
                        }
                    } @else {
                        @if (settings.host === 'button') {
                            <button
                                [class]="s.button"
                                [disabled]="p.disabledOwner === 'self' && disabled()"
                                [focusableWhenDisabled]="focusable()"
                                (onPressedChange)="change($event)"
                                (keydown)="consume($event)"
                                (click)="trace.click($event)"
                                rdxToolbarButton
                                rdxToggle
                                data-testid="subject"
                                data-item
                            >
                                Bold
                            </button>
                        } @else {
                            <!-- The composed directives supply focus and roving tabindex. -->
                            <span
                                [nativeButton]="false"
                                [class]="s.button"
                                [disabled]="p.disabledOwner === 'self' && disabled()"
                                [focusableWhenDisabled]="focusable()"
                                (onPressedChange)="change($event)"
                                (keydown)="consume($event)"
                                (click)="trace.click($event)"
                                rdxToolbarButton
                                rdxToggle
                                data-testid="subject"
                                data-item
                            >
                                Bold
                            </span>
                        }
                    }
                </div>
                <button rdxToolbarButton data-testid="last" data-item>Last</button>
            </div>
        </form>
        <button type="button" tabindex="0" data-testid="after">After</button>
        <output data-testid="toggle-epoch">{{ epoch() }}</output>
        <output data-testid="toggle-changes">{{ changesJson() }}</output>
        @if (p.action !== 'disabled') {
            <div class="h-[2400px]"></div>
        }
    `
})
export class AngularToggle {
    readonly settings = config();
    readonly p = this.settings.toggle!;
    readonly s = classes;
    readonly trace = installProbe('angular', this.settings);
    readonly changes = signal<ToggleChange[]>([]);
    readonly disabled = signal(this.p.action === 'disabled');
    readonly focusable = signal(this.p.focusable ?? true);
    readonly epoch = signal(0);
    constructor() {
        const command = (event: KeyboardEvent) => {
            if (this.p.action !== 'disabled' || !['F6', 'F7'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F6') this.disabled.update((value) => !value);
            else this.focusable.update((value) => !value);
            this.epoch.update((value) => value + 1);
        };
        document.addEventListener('keydown', command, true);
        inject(DestroyRef).onDestroy(() => document.removeEventListener('keydown', command, true));
    }
    changesJson() {
        return JSON.stringify(this.changes());
    }
    consume(event: KeyboardEvent) {
        if (
            (this.p.action === 'prevent-enter' && event.key === 'Enter') ||
            (this.p.action === 'prevent-space' && event.key === ' ')
        )
            event.preventDefault();
    }
    change(change: RdxTogglePressedChangeEvent) {
        const event = change.eventDetails.event as MouseEvent;
        this.changes.update((values) => [
            ...values,
            {
                pressed: change.pressed,
                type: event.type,
                reason: change.eventDetails.reason,
                trusted: event.isTrusted,
                shift: !!event.shiftKey,
                ctrl: !!event.ctrlKey
            }
        ]);
        if (this.p.action === 'cancel-change') change.eventDetails.cancel();
    }
}
