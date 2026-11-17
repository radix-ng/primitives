import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { RdxToolbarButton, RdxToolbarRoot } from '@radix-ng/primitives/toolbar';
import { AngularAuthoredTarget } from './authored-target.angular';
import { classes, config, installProbe } from './contract';

@Component({
    selector: 'parity-button',
    imports: [AngularAuthoredTarget, RdxCompositeRoot, RdxCompositeItem, RdxToolbarRoot, RdxToolbarButton],
    template: `
        <button type="button" tabindex="0" data-testid="before">Before</button>
        <form [class]="s.form" (submit)="trace.submit($event)">
            <input data-testid="field" value="initial" aria-label="Form field" />
            @switch (p.scope) {
                @case ('standalone') {
                    <parity-authored-target [state]="state" [trace]="trace" />
                }
                @case ('composite') {
                    <div
                        [disabledIndices]="disabled() && !focusable() ? [1] : []"
                        rdxCompositeRoot
                        data-testid="collection"
                    >
                        <button type="button" rdxCompositeItem data-testid="first" data-item>First</button>
                        <parity-authored-target [state]="state" [trace]="trace" />
                        <button type="button" rdxCompositeItem data-testid="last" data-item>Last</button>
                    </div>
                }
                @case ('toolbar') {
                    <div rdxToolbarRoot data-testid="collection" aria-label="Actions">
                        <button rdxToolbarButton data-testid="first" data-item>First</button>
                        <parity-authored-target [state]="state" [trace]="trace" />
                        <button rdxToolbarButton data-testid="last" data-item>Last</button>
                    </div>
                }
            }
        </form>
        <button type="button" tabindex="0" data-testid="after">After</button>
        <output data-testid="epoch">{{ epoch() }}</output>
    `
})
export class AngularAuthored {
    readonly settings = config();
    readonly p = this.settings.authored!;
    readonly s = classes;
    readonly role = signal<string | null | undefined>(this.p.role);
    readonly tabIndex = signal<number | null | undefined>(this.p.tabIndex);
    readonly disabled = signal(false);
    readonly focusable = signal(false);
    readonly epoch = signal(0);
    readonly state = {
        role: this.role,
        tabIndex: this.tabIndex,
        disabled: this.disabled,
        focusable: this.focusable,
        epoch: this.epoch
    };
    readonly trace = installProbe('angular', this.settings);
    constructor() {
        const command = (event: KeyboardEvent) => {
            if (!['F6', 'F7', 'F9', 'F10', 'F11'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F6') this.disabled.update((value) => !value);
            if (event.key === 'F7') this.focusable.update((value) => !value);
            if (event.key === 'F9') {
                this.role.set('option');
                this.tabIndex.set(0);
            }
            if (event.key === 'F10') {
                this.role.set(null);
                this.tabIndex.set(null);
            }
            if (event.key === 'F11') {
                this.role.set(undefined);
                this.tabIndex.set(undefined);
            }
            this.epoch.update((value) => value + 1);
        };
        document.addEventListener('keydown', command, true);
        inject(DestroyRef).onDestroy(() => document.removeEventListener('keydown', command, true));
    }
}
