import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxCollapsiblePanelDirective } from '../src/collapsible-panel.directive';
import { RdxCollapsibleOpenChangeEvent, RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';
import { RdxCollapsibleTriggerDirective } from '../src/collapsible-trigger.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCollapsibleRootDirective, RdxCollapsibleTriggerDirective, RdxCollapsiblePanelDirective],
    template: `
        <div [disabled]="disabled()" [open]="open()" (onOpenChange)="handleOpenChange($event)" rdxCollapsibleRoot>
            <button rdxCollapsibleTrigger>Trigger</button>
            <div
                [hiddenUntilFound]="hiddenUntilFound()"
                [id]="panelId()"
                [keepMounted]="keepMounted()"
                rdxCollapsiblePanel
            >
                Panel
            </div>
        </div>
    `
})
class CollapsibleHost {
    readonly open = signal(false);
    readonly disabled = signal(false);
    readonly keepMounted = signal<boolean | undefined>(undefined);
    readonly hiddenUntilFound = signal<boolean | undefined>(undefined);
    readonly panelId = signal<string | undefined>(undefined);
    readonly changes: RdxCollapsibleOpenChangeEvent[] = [];

    cancelNextChange = false;

    handleOpenChange(change: RdxCollapsibleOpenChangeEvent): void {
        this.changes.push(change);

        if (this.cancelNextChange) {
            change.eventDetails.cancel();
            this.cancelNextChange = false;
            return;
        }

        this.open.set(change.open);
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCollapsibleRootDirective, RdxCollapsibleTriggerDirective, RdxCollapsiblePanelDirective],
    template: `
        <div defaultOpen rdxCollapsibleRoot>
            <button rdxCollapsibleTrigger>Trigger</button>
            <div rdxCollapsiblePanel>Panel</div>
        </div>
    `
})
class DefaultOpenHost {}

describe('RdxCollapsibleRootDirective', () => {
    let fixture: ComponentFixture<CollapsibleHost>;
    let host: CollapsibleHost;

    const trigger = () =>
        fixture.debugElement.query(By.css('[rdxCollapsibleTrigger]')).nativeElement as HTMLButtonElement;
    const panel = () => fixture.nativeElement.querySelector('[rdxCollapsiblePanel]') as HTMLElement | null;

    function setup() {
        fixture = TestBed.createComponent(CollapsibleHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    }

    it('unmounts the closed panel by default', () => {
        setup();

        expect(trigger().getAttribute('aria-expanded')).toBe('false');
        expect(trigger().getAttribute('aria-controls')).toBeNull();
        expect(panel()).toBeNull();
    });

    it('opens from the trigger and emits cancelable event details', () => {
        setup();

        trigger().click();
        fixture.detectChanges();

        const renderedPanel = panel();

        expect(host.changes).toHaveLength(1);
        expect(host.changes[0].open).toBe(true);
        expect(host.changes[0].eventDetails.reason).toBe('trigger-press');
        expect(host.changes[0].eventDetails.event).toBeInstanceOf(MouseEvent);
        expect(host.changes[0].eventDetails.trigger).toBe(trigger());
        expect(renderedPanel).not.toBeNull();
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
        expect(trigger().getAttribute('aria-controls')).toBe(renderedPanel?.id);
    });

    it('does not commit a canceled trigger change', () => {
        setup();
        host.cancelNextChange = true;

        trigger().click();
        fixture.detectChanges();

        expect(host.changes).toHaveLength(1);
        expect(host.open()).toBe(false);
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
        expect(panel()).toBeNull();
    });

    it('keeps disabled triggers focusable and inert', () => {
        setup();
        host.disabled.set(true);
        fixture.detectChanges();

        expect(trigger().getAttribute('data-disabled')).toBe('');
        expect(trigger().getAttribute('aria-disabled')).toBe('true');
        expect(trigger().hasAttribute('disabled')).toBe(false);

        trigger().click();
        fixture.detectChanges();

        expect(host.changes).toHaveLength(0);
        expect(host.open()).toBe(false);
    });

    it('uses the panel id for trigger aria-controls', () => {
        setup();
        host.panelId.set('custom-panel-id');
        host.open.set(true);
        fixture.detectChanges();

        expect(panel()?.id).toBe('custom-panel-id');
        expect(trigger().getAttribute('aria-controls')).toBe('custom-panel-id');
    });

    it('opens hiddenUntilFound panels on beforematch with reason none', () => {
        setup();
        host.hiddenUntilFound.set(true);
        fixture.detectChanges();

        const hiddenPanel = panel();

        expect(hiddenPanel).not.toBeNull();
        expect(hiddenPanel?.getAttribute('hidden')).toBe('until-found');

        hiddenPanel?.dispatchEvent(new Event('beforematch'));
        fixture.detectChanges();

        expect(host.open()).toBe(true);
        expect(host.changes.at(-1)?.eventDetails.reason).toBe('none');
        expect(panel()?.getAttribute('hidden')).toBeNull();
    });

    it('applies defaultOpen before first interaction', () => {
        const defaultOpenFixture = TestBed.createComponent(DefaultOpenHost);
        defaultOpenFixture.detectChanges();

        const defaultTrigger = defaultOpenFixture.debugElement.query(By.css('[rdxCollapsibleTrigger]'))
            .nativeElement as HTMLButtonElement;
        const defaultPanel = defaultOpenFixture.nativeElement.querySelector(
            '[rdxCollapsiblePanel]'
        ) as HTMLElement | null;

        expect(defaultTrigger.getAttribute('aria-expanded')).toBe('true');
        expect(defaultPanel).not.toBeNull();
        expect(defaultPanel?.getAttribute('data-open')).toBe('');
    });
});
