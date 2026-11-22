import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-label',
    imports: [RdxLabelDirective],
    host: {
        '[attr.data-control-clicks]': 'controlClicks()',
        '[attr.data-details-clicks]': 'detailsClicks()'
    },
    template: `
        <div>
            <label rdxLabel for="label-email" data-label-node="email-label">Email</label>
            <input id="label-email" (click)="activate()" type="text" data-label-node="email" />
        </div>
        <div>
            <label rdxLabel data-label-node="wrapped-label">
                <span>Remember me</span>
                <input id="label-remember" (click)="activate()" type="checkbox" data-label-node="remember" />
            </label>
        </div>
        <div>
            <label rdxLabel for="label-disabled" data-label-node="disabled-label">Disabled alerts</label>
            <input id="label-disabled" (click)="activate()" type="checkbox" data-label-node="disabled" disabled />
        </div>
        <div>
            @for (revision of [revision()]; track revision) {
                <label id="alerts-label" [htmlFor]="target()" rdxLabel data-label-node="alerts-label">
                    <span>Delivery alerts</span>
                    <button (click)="detailsClicks.set(detailsClicks() + 1)" type="button"><span>Details</span></button>
                    <a href="#label-help"><span>Help</span></a>
                </label>
                <input id="label-alerts" (click)="activate()" type="checkbox" data-label-node="alerts" />
            }
            <input id="label-sms" (click)="activate()" type="checkbox" data-label-node="sms" />
        </div>
        <button (click)="revision.set(revision() + 1)" type="button">Replace label and control</button>
        <button (click)="target.set('label-sms')" type="button">Retarget label</button>
        <p id="label-help">Alert settings help</p>
    `
})
export default class Page {
    protected readonly controlClicks = signal(0);
    protected readonly detailsClicks = signal(0);
    protected readonly revision = signal(0);
    protected readonly target = signal('label-alerts');

    protected activate(): void {
        this.controlClicks.update((clicks) => clicks + 1);
    }
}
