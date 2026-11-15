import { Component } from '@angular/core';
import {
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsRoot,
    RdxTabsTab,
    type RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { installActivationProbe } from './activation';
import { classes, config, installProbe } from './contract';

@Component({
    selector: 'parity-tabs-activation',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    template: `
        <button type="button" data-testid="before">Before</button>
        <form (submit)="activation.submit($event)">
            <div
                [class]="s.root"
                (onValueChange)="change($event)"
                data-testid="tabs-root"
                defaultValue="zero"
                rdxTabsRoot
            >
                <div [class]="s.list" [activateOnFocus]="!!p.secondary" aria-label="Activation tabs" rdxTabsList>
                    <button id="tab-zero" [class]="s.tab" data-testid="tab-0" value="zero" rdxTabsTab>Zero</button>
                    @switch (p.host) {
                        @case ('button') {
                            <button
                                id="tab-one"
                                [class]="s.tab"
                                [disabled]="!!p.disabled"
                                data-testid="tab-1"
                                value="one"
                                rdxTabsTab
                            >
                                One
                            </button>
                        }
                        @case ('div') {
                            <div
                                id="tab-one"
                                [class]="s.tab"
                                [disabled]="!!p.disabled"
                                [nativeButton]="false"
                                data-testid="tab-1"
                                value="one"
                                rdxTabsTab
                            >
                                One
                                @if (p.descendant) {
                                    <span tabindex="0" data-testid="child">Child</span>
                                }
                            </div>
                        }
                        @case ('link') {
                            <a
                                id="tab-one"
                                [class]="s.tab"
                                [disabled]="!!p.disabled"
                                [nativeButton]="false"
                                href="#activated"
                                data-testid="tab-1"
                                value="one"
                                rdxTabsTab
                            >
                                One
                            </a>
                        }
                        @case ('anchor') {
                            <a
                                id="tab-one"
                                [class]="s.tab"
                                [nativeButton]="false"
                                data-testid="tab-1"
                                value="one"
                                rdxTabsTab
                            >
                                One
                            </a>
                        }
                    }
                </div>
                <div rdxTabsPanel value="zero" keepMounted>Zero panel</div>
                <div rdxTabsPanel value="one" keepMounted>One panel</div>
            </div>
        </form>
        <button type="button" data-testid="after">After</button>
        <div class="h-[2200px]"></div>
    `
})
export class AngularActivation {
    readonly settings = config();
    readonly p = this.settings.activation!;
    readonly s = classes;
    readonly trace = installProbe('angular', this.settings);
    readonly activation = installActivationProbe(this.p);
    change({ value, eventDetails: details }: RdxTabsValueChangeEvent) {
        if (this.p.cancel === 'all' || (this.p.cancel === 'first' && this.activation.probe.callbacks.length === 0))
            details.cancel();
        this.trace.change(
            value,
            details.reason,
            details.activationDirection,
            details.isCanceled(),
            details.event,
            details.trigger
        );
        this.activation.change(
            value,
            details.reason,
            details.activationDirection,
            details.isCanceled(),
            details.event,
            details.trigger
        );
    }
}
