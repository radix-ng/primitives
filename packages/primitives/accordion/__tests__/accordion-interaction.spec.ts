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
