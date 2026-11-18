import { NgTemplateOutlet } from '@angular/common';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { activationProbe } from './activation-probe';
import { settings } from './contract';

@Component({
    selector: 'parity-accordion',
    imports: [
        NgTemplateOutlet,
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <button type="button" data-testid="before">Before</button>
        <button (click)="disabled.set(false)" type="button" data-testid="enable">Enable</button>
        <form (submit)="probe.submit($event)" (reset)="probe.reset()">
            <input data-testid="field" aria-label="Form field" value="initial" />
            <!-- Passive ancestor observes propagation; it is not an interactive control. -->
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <div (click)="probe.ancestor($event)">
                <div
                    [disabled]="disabled() && p.owner === 'root'"
                    (onValueChange)="probe.request('root', $event.value, $event.eventDetails)"
                    rdxAccordionRoot
                    keepMounted
                >
                    <div
                        [disabled]="disabled() && p.owner === 'item'"
                        (onOpenChange)="probe.request('a', $event.open, $event.eventDetails)"
                        rdxAccordionItem
                        value="a"
                    >
                        <h3 rdxAccordionHeader>
                            @switch (p.host) {
                                @case ('button') {
                                    <button
                                        class="inline-block p-4"
                                        [type]="p.type ?? 'button'"
                                        [disabled]="disabled() && p.owner === 'trigger'"
                                        (click)="probe.consume($event)"
                                        (keydown)="keydown($event)"
                                        (keyup)="probe.consume($event)"
                                        (pointerdown)="probe.consume($event)"
                                        (mousedown)="probe.consume($event)"
                                        rdxAccordionTrigger
                                        data-testid="a-trigger"
                                    >
                                        <ng-container *ngTemplateOutlet="label" />
                                    </button>
                                }
                                @case ('link') {
                                    <a
                                        class="inline-block p-4"
                                        [disabled]="disabled() && p.owner === 'trigger'"
                                        (click)="probe.consume($event)"
                                        (keydown)="keydown($event)"
                                        (keyup)="probe.consume($event)"
                                        (pointerdown)="probe.consume($event)"
                                        (mousedown)="probe.consume($event)"
                                        rdxAccordionTrigger
                                        data-testid="a-trigger"
                                        href="#accordion-activated"
                                    >
                                        <ng-container *ngTemplateOutlet="label" />
                                    </a>
                                }
                                @case ('anchor') {
                                    <a
                                        class="inline-block p-4"
                                        [disabled]="disabled() && p.owner === 'trigger'"
                                        (click)="probe.consume($event)"
                                        (keydown)="keydown($event)"
                                        (keyup)="probe.consume($event)"
                                        (pointerdown)="probe.consume($event)"
                                        (mousedown)="probe.consume($event)"
                                        rdxAccordionTrigger
                                        data-testid="a-trigger"
                                    >
                                        <ng-container *ngTemplateOutlet="label" />
                                    </a>
                                }
                                @case ('span') {
                                    <span
                                        class="inline-block p-4"
                                        [disabled]="disabled() && p.owner === 'trigger'"
                                        (click)="probe.consume($event)"
                                        (keydown)="keydown($event)"
                                        (keyup)="probe.consume($event)"
                                        (pointerdown)="probe.consume($event)"
                                        (mousedown)="probe.consume($event)"
                                        rdxAccordionTrigger
                                        data-testid="a-trigger"
                                    >
                                        <ng-container *ngTemplateOutlet="label" />
                                    </span>
                                }
                            }
                        </h3>
                        <div *rdxAccordionPanelPresence rdxAccordionPanel data-testid="a-panel">Content a</div>
                    </div>
                    <div
                        (onOpenChange)="probe.request('b', $event.open, $event.eventDetails)"
                        rdxAccordionItem
                        value="b"
                    >
                        <h3 rdxAccordionHeader><button rdxAccordionTrigger data-testid="b-trigger">b</button></h3>
                        <div *rdxAccordionPanelPresence rdxAccordionPanel data-testid="b-panel">Content b</div>
                    </div>
                </div>
            </div>
        </form>
        <button type="button" data-testid="after">After</button>
        <ng-template #label>
            <span [attr.tabindex]="p.action === 'child-key' ? 0 : undefined" data-testid="a-child">a</span>
        </ng-template>
    `
})
export class AngularActivationAccordion {
    readonly s = settings();
    readonly p = this.s.activation!;
    readonly probe = activationProbe(this.s);
    readonly disabled = signal(false);
    private interrupted = false;
    constructor() {
        const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        const destroy = inject(DestroyRef);
        afterNextRender(() => destroy.onDestroy(this.probe.install(host.querySelector('[data-testid="a-trigger"]')!)));
    }
    keydown(event: KeyboardEvent) {
        this.probe.consume(event);
        if (this.p.action === 'disable-held' && event.key === ' ' && !this.interrupted) {
            this.interrupted = true;
            this.disabled.set(true);
        }
    }
}
