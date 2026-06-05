import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { RdxAccordionContentDirective } from '../src/accordion-content.directive';
import { RdxAccordionHeaderDirective } from '../src/accordion-header.directive';
import { RdxAccordionItemDirective } from '../src/accordion-item.directive';
import { RdxAccordionRootDirective } from '../src/accordion-root.directive';
import { RdxAccordionTriggerDirective } from '../src/accordion-trigger.directive';

@Component({
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div
            [disabled]="rootDisabled()"
            (onValueChange)="onValueChange($event)"
            type="single"
            collapsible
            rdxAccordionRoot
        >
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader>
                    <button id="trigger-one" rdxAccordionTrigger>Trigger one</button>
                </div>
                <div rdxAccordionContent>Content one</div>
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
    const content = () => fixture.debugElement.query(By.css('[rdxAccordionContent]')).nativeElement as HTMLElement;

    beforeEach(() => {
        fixture = TestBed.createComponent(AccordionHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    // A2
    it('emits onValueChange with the new value when toggled', () => {
        trigger().click();
        fixture.detectChanges();

        expect(host.onValueChange).toHaveBeenCalledWith('one');
        expect(content().getAttribute('data-state')).toBe('open');
    });

    // A1
    it('does not open when the accordion root is disabled', () => {
        host.rootDisabled.set(true);
        fixture.detectChanges();

        trigger().click();
        fixture.detectChanges();

        expect(content().getAttribute('data-state')).toBe('closed');
        expect(host.onValueChange).not.toHaveBeenCalled();
        expect(trigger().getAttribute('disabled')).toBe('');
    });

    // A3
    it('links content aria-labelledby to the trigger id (reactively)', () => {
        const id = trigger().getAttribute('id');

        expect(id).toBeTruthy();
        expect(content().getAttribute('aria-labelledby')).toBe(id);
    });
});

// ─── disabled propagation ────────────────────────────────────────────────────

@Component({
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div [disabled]="rootDisabled()" rdxAccordionRoot collapsible>
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionContent>Content</div>
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
    const content = () => fixture.debugElement.query(By.css('[rdxAccordionContent]')).nativeElement as HTMLElement;

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
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div [multiple]="multipleEnabled()" rdxAccordionRoot collapsible>
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button id="t1" rdxAccordionTrigger>One</button></div>
                <div rdxAccordionContent>One</div>
            </div>
            <div value="two" rdxAccordionItem>
                <div rdxAccordionHeader><button id="t2" rdxAccordionTrigger>Two</button></div>
                <div rdxAccordionContent>Two</div>
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
        fixture.debugElement.queryAll(By.css('[rdxAccordionContent]')).map((d) => d.nativeElement as HTMLElement);

    beforeEach(() => {
        fixture = TestBed.createComponent(MultipleHost);
        fixture.detectChanges();
    });

    it('closes previous item in single mode (default)', () => {
        triggers()[0].click();
        fixture.detectChanges();
        triggers()[1].click();
        fixture.detectChanges();

        expect(contents()[0].getAttribute('data-state')).toBe('closed');
        expect(contents()[1].getAttribute('data-state')).toBe('open');
    });

    it('keeps both items open when multiple=true', () => {
        fixture.componentInstance.multipleEnabled.set(true);
        fixture.detectChanges();

        triggers()[0].click();
        fixture.detectChanges();
        triggers()[1].click();
        fixture.detectChanges();

        expect(contents()[0].getAttribute('data-state')).toBe('open');
        expect(contents()[1].getAttribute('data-state')).toBe('open');
    });

    it('type="multiple" still works for backwards compatibility', () => {
        fixture.destroy();
        @Component({
            imports: [
                RdxAccordionRootDirective,
                RdxAccordionItemDirective,
                RdxAccordionHeaderDirective,
                RdxAccordionTriggerDirective,
                RdxAccordionContentDirective
            ],
            template: `
                <div type="multiple" rdxAccordionRoot>
                    <div value="one" rdxAccordionItem>
                        <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                        <div rdxAccordionContent>One</div>
                    </div>
                    <div value="two" rdxAccordionItem>
                        <div rdxAccordionHeader><button rdxAccordionTrigger>Two</button></div>
                        <div rdxAccordionContent>Two</div>
                    </div>
                </div>
            `
        })
        class TypeMultipleHost {}

        const f = TestBed.createComponent(TypeMultipleHost);
        f.detectChanges();

        const t = f.debugElement.queryAll(By.css('[rdxAccordionTrigger]')).map((d) => d.nativeElement as HTMLElement);
        const c = f.debugElement.queryAll(By.css('[rdxAccordionContent]')).map((d) => d.nativeElement as HTMLElement);

        t[0].click();
        f.detectChanges();
        t[1].click();
        f.detectChanges();

        expect(c[0].getAttribute('data-state')).toBe('open');
        expect(c[1].getAttribute('data-state')).toBe('open');
    });
});

// ─── onOpenChange ─────────────────────────────────────────────────────────────

@Component({
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div collapsible rdxAccordionRoot>
            <div (onOpenChange)="onChange($event)" value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionContent>One</div>
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

    it('emits true when item opens', () => {
        trigger().click();
        fixture.detectChanges();
        expect(fixture.componentInstance.onChange).toHaveBeenCalledWith(true);
    });

    it('emits false when item closes', () => {
        trigger().click();
        fixture.detectChanges();
        fixture.componentInstance.onChange.mockClear();

        trigger().click();
        fixture.detectChanges();
        expect(fixture.componentInstance.onChange).toHaveBeenCalledWith(false);
    });
});

// ─── data-index ──────────────────────────────────────────────────────────────

@Component({
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div rdxAccordionRoot>
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionContent>One</div>
            </div>
            <div value="two" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>Two</button></div>
                <div rdxAccordionContent>Two</div>
            </div>
            <div value="three" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>Three</button></div>
                <div rdxAccordionContent>Three</div>
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
    const triggers = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionTrigger]')).map((d) => d.nativeElement as HTMLElement);
    const contents = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionContent]')).map((d) => d.nativeElement as HTMLElement);

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

    it('sets data-index on triggers', () => {
        expect(triggers()[0].getAttribute('data-index')).toBe('0');
        expect(triggers()[1].getAttribute('data-index')).toBe('1');
        expect(triggers()[2].getAttribute('data-index')).toBe('2');
    });

    it('sets data-index on contents', () => {
        expect(contents()[0].getAttribute('data-index')).toBe('0');
        expect(contents()[1].getAttribute('data-index')).toBe('1');
        expect(contents()[2].getAttribute('data-index')).toBe('2');
    });
});

// ─── loopFocus ───────────────────────────────────────────────────────────────

@Component({
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div [loopFocus]="loop()" rdxAccordionRoot>
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionContent>One</div>
            </div>
            <div value="two" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>Two</button></div>
                <div rdxAccordionContent>Two</div>
            </div>
        </div>
    `
})
class LoopFocusHost {
    readonly loop = signal(true);
}

describe('RdxAccordion — loopFocus', () => {
    let fixture: ComponentFixture<LoopFocusHost>;

    const triggers = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionTrigger]')).map((d) => d.nativeElement as HTMLElement);

    beforeEach(() => {
        fixture = TestBed.createComponent(LoopFocusHost);
        fixture.detectChanges();
    });

    it('wraps focus to first trigger when ArrowDown on last (loopFocus=true)', () => {
        const last = triggers()[1];
        last.focus();
        last.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggers()[0]);
    });

    it('does not wrap focus when ArrowDown on last (loopFocus=false)', () => {
        fixture.componentInstance.loop.set(false);
        fixture.detectChanges();

        const last = triggers()[1];
        last.focus();
        last.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        fixture.detectChanges();

        expect(document.activeElement).toBe(last);
    });
});

// ─── keepMounted ─────────────────────────────────────────────────────────────

@Component({
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div [keepMounted]="keep()" rdxAccordionRoot collapsible>
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button rdxAccordionTrigger>One</button></div>
                <div rdxAccordionContent>Content one</div>
            </div>
        </div>
    `
})
class KeepMountedHost {
    readonly keep = signal(false);
}

describe('RdxAccordion — keepMounted', () => {
    let fixture: ComponentFixture<KeepMountedHost>;

    const trigger = () => fixture.debugElement.query(By.css('[rdxAccordionTrigger]')).nativeElement as HTMLElement;
    const content = () => fixture.debugElement.query(By.css('[rdxAccordionContent]')).nativeElement as HTMLElement;

    beforeEach(() => {
        fixture = TestBed.createComponent(KeepMountedHost);
        fixture.detectChanges();
    });

    it('hides closed content with hidden="until-found" by default', () => {
        expect(content().getAttribute('hidden')).toBe('until-found');
    });

    it('does not set hidden on closed content when keepMounted=true', () => {
        fixture.componentInstance.keep.set(true);
        fixture.detectChanges();

        expect(content().getAttribute('hidden')).toBeNull();
        // still reports closed state so consumer CSS can collapse it
        expect(content().getAttribute('data-state')).toBe('closed');
    });

    it('keeps content unhidden when open regardless of keepMounted', () => {
        trigger().click();
        fixture.detectChanges();

        expect(content().getAttribute('hidden')).toBeNull();
        expect(content().getAttribute('data-state')).toBe('open');
    });
});

// ─── single mode lock (no flicker on re-click) ───────────────────────────────

@Component({
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div [defaultValue]="'one'" (onValueChange)="onValueChange($event)" type="single" rdxAccordionRoot>
            <div value="one" rdxAccordionItem>
                <div rdxAccordionHeader><button id="t1" rdxAccordionTrigger>One</button></div>
                <div rdxAccordionContent>One</div>
            </div>
            <div value="two" rdxAccordionItem>
                <div rdxAccordionHeader><button id="t2" rdxAccordionTrigger>Two</button></div>
                <div rdxAccordionContent>Two</div>
            </div>
        </div>
    `
})
class SingleLockHost {
    readonly onValueChange = vi.fn();
}

describe('RdxAccordion — single mode lock', () => {
    let fixture: ComponentFixture<SingleLockHost>;

    const triggers = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionTrigger]')).map((d) => d.nativeElement as HTMLElement);
    const contents = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionContent]')).map((d) => d.nativeElement as HTMLElement);

    beforeEach(() => {
        fixture = TestBed.createComponent(SingleLockHost);
        fixture.detectChanges();
    });

    it('re-clicking the open item keeps it open without emitting (no flicker)', () => {
        // item-1 is open by default
        expect(contents()[0].getAttribute('data-state')).toBe('open');

        triggers()[0].click();
        fixture.detectChanges();

        // stays open, and no value churn was emitted
        expect(contents()[0].getAttribute('data-state')).toBe('open');
        expect(fixture.componentInstance.onValueChange).not.toHaveBeenCalled();
    });

    it('does not unmount/hide the open content when re-clicked', () => {
        triggers()[0].click();
        fixture.detectChanges();

        expect(contents()[0].getAttribute('hidden')).toBeNull();
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
