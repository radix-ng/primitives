import { RdxAccordionHeaderDirective } from '../src/accordion-header.directive';
import { RdxAccordionItemDirective } from '../src/accordion-item.directive';
import { RdxAccordionPanelDirective } from '../src/accordion-panel.directive';
import { RdxAccordionRootDirective } from '../src/accordion-root.directive';
import { RdxAccordionTriggerDirective } from '../src/accordion-trigger.directive';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { expect, vi } from 'vitest';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div keepMounted rdxAccordionRoot [disabled]="rootDisabled()" (onValueChange)="onValueChange($event)">
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader>
                    <button id="trigger-one" rdxAccordionTrigger>Trigger one</button>
                </div>
                <div rdxAccordionPanel>Content one</div>
            </div>
        </div>
    `
})
class AccordionHost {
    readonly rootDisabled = signal(false);
    readonly onValueChange = vi.fn();
}

describe('RdxAccordion — interaction', () => {
    let fixture: ComponentFixture<AccordionHost>;
    let host: AccordionHost;

    const trigger = () => fixture.debugElement.query(By.css('[rdxAccordionTrigger]')).nativeElement as HTMLElement;
    const content = () => fixture.debugElement.query(By.css('[rdxAccordionPanel]')).nativeElement as HTMLElement;

    beforeEach(() => {
        fixture = TestBed.createComponent(AccordionHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    // A2 — Base UI emits `{ value, eventDetails }` and exposes `data-open`.
    it('emits onValueChange with the new value when toggled', () => {
        trigger().click();
        fixture.detectChanges();

        expect(host.onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'one' }));
        expect(content().getAttribute('data-open')).toBe('');
    });

    // Trigger links `aria-controls` to its panel only while open (the panel id exists then).
    it('wires aria-controls to the panel id only while open', () => {
        expect(trigger().hasAttribute('aria-controls')).toBe(false);

        trigger().click();
        fixture.detectChanges();

        expect(trigger().getAttribute('aria-controls')).toBe(content().getAttribute('id'));

        trigger().click();
        fixture.detectChanges();

        expect(trigger().hasAttribute('aria-controls')).toBe(false);
    });

    // A1 — disabled triggers stay focusable via `aria-disabled` (Base UI parity).
    it('does not open when the accordion root is disabled', () => {
        host.rootDisabled.set(true);
        fixture.detectChanges();

        trigger().click();
        fixture.detectChanges();

        expect(content().getAttribute('data-open')).toBeNull();
        expect(host.onValueChange).not.toHaveBeenCalled();
        expect(trigger().getAttribute('aria-disabled')).toBe('true');
        expect(trigger().getAttribute('data-disabled')).toBe('');
        expect(trigger().hasAttribute('disabled')).toBe(false);
    });

    // A3
    it('links content aria-labelledby to the trigger id (reactively)', () => {
        const id = trigger().getAttribute('id');

        expect(id).toBeTruthy();
        expect(content().getAttribute('aria-labelledby')).toBe(id);
    });
});

// ─── value-change cancellation ────────────────────────────────────────────────

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div keepMounted rdxAccordionRoot (onValueChange)="onValueChange($event)">
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionPanel>One</div>
            </div>
        </div>
    `
})
class CancelHost {
    readonly onValueChange = vi.fn((event: { eventDetails: { cancel: () => void } }) => event.eventDetails.cancel());
}

describe('RdxAccordion — cancelable onValueChange', () => {
    let fixture: ComponentFixture<CancelHost>;

    const trigger = () => fixture.debugElement.query(By.css('[rdxAccordionTrigger]')).nativeElement as HTMLElement;
    const content = () => fixture.debugElement.query(By.css('[rdxAccordionPanel]')).nativeElement as HTMLElement;

    beforeEach(() => {
        fixture = TestBed.createComponent(CancelHost);
        fixture.detectChanges();
    });

    it('does not commit the value when eventDetails.cancel() is called', () => {
        trigger().click();
        fixture.detectChanges();

        expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 'one',
                eventDetails: expect.objectContaining({ reason: 'trigger-press' })
            })
        );
        // canceled → stays closed
        expect(content().getAttribute('data-open')).toBeNull();
    });
});

// ─── disabled propagation ────────────────────────────────────────────────────

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div keepMounted rdxAccordionRoot [disabled]="rootDisabled()">
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionPanel>Content</div>
            </div>
        </div>
    `
})
class DisabledPropagationHost {
    readonly rootDisabled = signal(false);
}

describe('RdxAccordion — disabled propagation', () => {
    let fixture: ComponentFixture<DisabledPropagationHost>;

    const root = () => fixture.debugElement.query(By.css('[rdxAccordionRoot]')).nativeElement as HTMLElement;
    const item = () => fixture.debugElement.query(By.css('[rdxAccordionItem]')).nativeElement as HTMLElement;
    const header = () => fixture.debugElement.query(By.css('[rdxAccordionHeader]')).nativeElement as HTMLElement;
    const trigger = () => fixture.debugElement.query(By.css('[rdxAccordionTrigger]')).nativeElement as HTMLElement;
    const content = () => fixture.debugElement.query(By.css('[rdxAccordionPanel]')).nativeElement as HTMLElement;

    beforeEach(() => {
        fixture = TestBed.createComponent(DisabledPropagationHost);
        fixture.componentInstance.rootDisabled.set(false);
        fixture.detectChanges();
    });

    it('sets data-disabled on root when disabled', () => {
        fixture.componentInstance.rootDisabled.set(true);
        fixture.detectChanges();
        expect(root().getAttribute('data-disabled')).toBe('');
    });

    it('removes data-disabled from root when enabled', () => {
        fixture.componentInstance.rootDisabled.set(true);
        fixture.detectChanges();
        fixture.componentInstance.rootDisabled.set(false);
        fixture.detectChanges();
        expect(root().getAttribute('data-disabled')).toBeNull();
    });

    it('propagates root disabled to item data-disabled', () => {
        fixture.componentInstance.rootDisabled.set(true);
        fixture.detectChanges();
        expect(item().getAttribute('data-disabled')).toBe('');
    });

    it('propagates root disabled to header data-disabled', () => {
        fixture.componentInstance.rootDisabled.set(true);
        fixture.detectChanges();
        expect(header().getAttribute('data-disabled')).toBe('');
    });

    it('propagates root disabled to content data-disabled', () => {
        fixture.componentInstance.rootDisabled.set(true);
        fixture.detectChanges();
        expect(content().getAttribute('data-disabled')).toBe('');
    });

    it('does not set data-disabled="false" when not disabled', () => {
        expect(item().getAttribute('data-disabled')).toBeNull();
        expect(header().getAttribute('data-disabled')).toBeNull();
        expect(content().getAttribute('data-disabled')).toBeNull();
        expect(trigger().getAttribute('data-disabled')).toBeNull();
    });
});

// ─── multiple ────────────────────────────────────────────────────────────────

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div keepMounted rdxAccordionRoot [multiple]="multipleEnabled()">
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button id="t1" rdxAccordionTrigger>One</button></div>
                <div rdxAccordionPanel>One</div>
            </div>
            <div value="two" rdxAccordionItem>
                <div rdxAccordionHeader><button id="t2" rdxAccordionTrigger>Two</button></div>
                <div rdxAccordionPanel>Two</div>
            </div>
        </div>
    `
})
class MultipleHost {
    readonly multipleEnabled = signal(false);
}

describe('RdxAccordion — multiple input', () => {
    let fixture: ComponentFixture<MultipleHost>;

    const triggers = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionTrigger]')).map((d) => d.nativeElement as HTMLElement);
    const contents = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionPanel]')).map((d) => d.nativeElement as HTMLElement);

    beforeEach(() => {
        fixture = TestBed.createComponent(MultipleHost);
        fixture.detectChanges();
    });

    it('closes previous item in single mode (default)', () => {
        triggers()[0].click();
        fixture.detectChanges();
        triggers()[1].click();
        fixture.detectChanges();

        expect(contents()[0].getAttribute('data-open')).toBeNull();
        expect(contents()[1].getAttribute('data-open')).toBe('');
    });

    it('keeps both items open when multiple=true', () => {
        fixture.componentInstance.multipleEnabled.set(true);
        fixture.detectChanges();

        triggers()[0].click();
        fixture.detectChanges();
        triggers()[1].click();
        fixture.detectChanges();

        expect(contents()[0].getAttribute('data-open')).toBe('');
        expect(contents()[1].getAttribute('data-open')).toBe('');
    });

    it('does not expose data-closed on the panel (Base UI parity)', () => {
        // closed panel (item two), kept mounted
        expect(contents()[1].getAttribute('data-open')).toBeNull();
        expect(contents()[1].getAttribute('data-closed')).toBeNull();
    });
});

// ─── onOpenChange ─────────────────────────────────────────────────────────────

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div rdxAccordionRoot>
            <div value="one" rdxAccordionItem (onOpenChange)="onChange($event)">
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionPanel>One</div>
            </div>
        </div>
    `
})
class OpenChangeHost {
    readonly onChange = vi.fn();
}

describe('RdxAccordion — onOpenChange', () => {
    let fixture: ComponentFixture<OpenChangeHost>;

    const trigger = () => fixture.debugElement.query(By.css('[rdxAccordionTrigger]')).nativeElement as HTMLElement;

    beforeEach(() => {
        fixture = TestBed.createComponent(OpenChangeHost);
        fixture.detectChanges();
    });

    it('does not emit on initial render', () => {
        expect(fixture.componentInstance.onChange).not.toHaveBeenCalled();
    });

    it('emits { open: true } when item opens', () => {
        trigger().click();
        fixture.detectChanges();
        expect(fixture.componentInstance.onChange).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
    });

    it('emits { open: false } when item closes', () => {
        trigger().click();
        fixture.detectChanges();
        fixture.componentInstance.onChange.mockClear();

        trigger().click();
        fixture.detectChanges();
        expect(fixture.componentInstance.onChange).toHaveBeenCalledWith(expect.objectContaining({ open: false }));
    });
});

// ─── data-index ──────────────────────────────────────────────────────────────

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div keepMounted rdxAccordionRoot>
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionPanel>One</div>
            </div>
            <div value="two" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>Two</button></div>
                <div rdxAccordionPanel>Two</div>
            </div>
            <div value="three" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>Three</button></div>
                <div rdxAccordionPanel>Three</div>
            </div>
        </div>
    `
})
class DataIndexHost {}

describe('RdxAccordion — data-index', () => {
    let fixture: ComponentFixture<DataIndexHost>;

    const items = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionItem]')).map((d) => d.nativeElement as HTMLElement);
    const headers = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionHeader]')).map((d) => d.nativeElement as HTMLElement);
    const contents = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionPanel]')).map((d) => d.nativeElement as HTMLElement);

    beforeEach(() => {
        fixture = TestBed.createComponent(DataIndexHost);
        fixture.detectChanges();
    });

    it('sets data-index on items in DOM order', () => {
        expect(items()[0].getAttribute('data-index')).toBe('0');
        expect(items()[1].getAttribute('data-index')).toBe('1');
        expect(items()[2].getAttribute('data-index')).toBe('2');
    });

    it('sets data-index on headers', () => {
        expect(headers()[0].getAttribute('data-index')).toBe('0');
        expect(headers()[1].getAttribute('data-index')).toBe('1');
        expect(headers()[2].getAttribute('data-index')).toBe('2');
    });

    it('does not set data-index on triggers (Base UI parity)', () => {
        const triggers = fixture.debugElement
            .queryAll(By.css('[rdxAccordionTrigger]'))
            .map((d) => d.nativeElement as HTMLElement);
        expect(triggers[0].getAttribute('data-index')).toBeNull();
    });

    it('sets data-index on contents', () => {
        expect(contents()[0].getAttribute('data-index')).toBe('0');
        expect(contents()[1].getAttribute('data-index')).toBe('1');
        expect(contents()[2].getAttribute('data-index')).toBe('2');
    });
});

// ─── keyboard focus ──────────────────────────────────────────────────────────

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div rdxAccordionRoot [loopFocus]="loop()">
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionPanel>One</div>
            </div>
            <div value="two" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>Two</button></div>
                <div rdxAccordionPanel>Two</div>
            </div>
        </div>
    `
})
class LoopFocusHost {
    readonly loop = signal(true);
}

describe('RdxAccordion — keyboard focus', () => {
    let fixture: ComponentFixture<LoopFocusHost>;

    const triggers = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionTrigger]')).map((d) => d.nativeElement as HTMLElement);

    beforeEach(() => {
        fixture = TestBed.createComponent(LoopFocusHost);
        fixture.detectChanges();
    });

    it.each(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'])(
        'does not manage focus on %s',
        (key) => {
            const first = triggers()[0];
            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

            first.focus();
            first.dispatchEvent(event);
            fixture.detectChanges();

            expect(event.defaultPrevented).toBe(false);
            expect(document.activeElement).toBe(first);
        }
    );

    it('keeps loopFocus as a deprecated no-op', () => {
        fixture.componentInstance.loop.set(false);
        fixture.detectChanges();

        const last = triggers()[1];
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });

        last.focus();
        last.dispatchEvent(event);
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(last);
    });
});

// ─── mount behavior (keepMounted / hiddenUntilFound) ──────────────────────────

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div rdxAccordionRoot [keepMounted]="keep()" [hiddenUntilFound]="findable()">
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionPanel>Content one</div>
            </div>
        </div>
    `
})
class MountHost {
    readonly keep = signal(false);
    readonly findable = signal(false);
}

describe('RdxAccordion — mount behavior', () => {
    let fixture: ComponentFixture<MountHost>;

    const trigger = () => fixture.debugElement.query(By.css('[rdxAccordionTrigger]')).nativeElement as HTMLElement;
    const panel = () => fixture.debugElement.query(By.css('[rdxAccordionPanel]'));

    beforeEach(() => {
        fixture = TestBed.createComponent(MountHost);
        fixture.detectChanges();
    });

    it('hides closed content with plain `hidden` by default (no longer hidden="until-found")', () => {
        expect(panel()).not.toBeNull();
        expect((panel().nativeElement as HTMLElement).getAttribute('hidden')).toBe('');
        expect((panel().nativeElement as HTMLElement).getAttribute('data-open')).toBeNull();
        // Base UI accordion panel has no `data-closed` (suppressed from the composed collapsible).
        expect((panel().nativeElement as HTMLElement).getAttribute('data-closed')).toBeNull();
    });

    it('keeps closed content mounted but hidden with keepMounted=true', () => {
        fixture.componentInstance.keep.set(true);
        fixture.detectChanges();

        expect(panel()).not.toBeNull();
        expect((panel().nativeElement as HTMLElement).getAttribute('hidden')).toBe('');
        expect((panel().nativeElement as HTMLElement).getAttribute('data-open')).toBeNull();
    });

    it('keeps closed content findable with hidden="until-found" when hiddenUntilFound=true', () => {
        fixture.componentInstance.findable.set(true);
        fixture.detectChanges();

        expect(panel()).not.toBeNull();
        expect((panel().nativeElement as HTMLElement).getAttribute('hidden')).toBe('until-found');
    });

    it('shows content (no hidden, data-open) when open', () => {
        trigger().click();
        fixture.detectChanges();

        expect(panel().nativeElement.getAttribute('hidden')).toBeNull();
        expect(panel().nativeElement.getAttribute('data-open')).toBe('');
    });
});

// ─── single mode (re-click closes; no flicker on the open item) ───────────────

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div keepMounted rdxAccordionRoot [defaultValue]="'one'" (onValueChange)="onValueChange($event)">
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button id="t1" rdxAccordionTrigger>One</button></div>
                <div rdxAccordionPanel>One</div>
            </div>
            <div value="two" rdxAccordionItem>
                <div rdxAccordionHeader><button id="t2" rdxAccordionTrigger>Two</button></div>
                <div rdxAccordionPanel>Two</div>
            </div>
        </div>
    `
})
class SingleModeHost {
    readonly onValueChange = vi.fn();
}

describe('RdxAccordion — single mode', () => {
    let fixture: ComponentFixture<SingleModeHost>;

    const triggers = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionTrigger]')).map((d) => d.nativeElement as HTMLElement);
    const contents = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionPanel]')).map((d) => d.nativeElement as HTMLElement);

    beforeEach(() => {
        fixture = TestBed.createComponent(SingleModeHost);
        fixture.detectChanges();
    });

    it('opens with defaultValue', () => {
        expect(contents()[0].getAttribute('data-open')).toBe('');
    });

    // Base UI single accordions are always collapsible — re-clicking the open item closes it.
    it('re-clicking the open item closes it', () => {
        triggers()[0].click();
        fixture.detectChanges();

        expect(contents()[0].getAttribute('data-open')).toBeNull();
        expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith(
            expect.objectContaining({ value: undefined })
        );
    });

    it('reflects open state via aria-expanded', () => {
        expect(triggers()[0].getAttribute('aria-expanded')).toBe('true');
        expect(triggers()[1].getAttribute('aria-expanded')).toBe('false');
    });

    it('switching to another item updates aria-expanded on both', () => {
        triggers()[1].click();
        fixture.detectChanges();

        expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
        expect(triggers()[1].getAttribute('aria-expanded')).toBe('true');
    });
});
