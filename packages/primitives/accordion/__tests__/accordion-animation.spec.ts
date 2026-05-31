import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxAccordionContentDirective } from '../src/accordion-content.directive';
import { RdxAccordionItemDirective } from '../src/accordion-item.directive';
import { RdxAccordionRootDirective } from '../src/accordion-root.directive';

@Component({
    imports: [RdxAccordionRootDirective, RdxAccordionItemDirective, RdxAccordionContentDirective],
    template: `
        <div [defaultValue]="'one'" type="single" rdxAccordionRoot>
            <div value="one" rdxAccordionItem>
                <div rdxAccordionContent>Content one</div>
            </div>
            <div value="two" rdxAccordionItem>
                <div rdxAccordionContent>Content two</div>
            </div>
        </div>
    `
})
class AccordionHost {}

describe('RdxAccordion — mount animation', () => {
    let fixture: ComponentFixture<AccordionHost>;

    const contents = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionContent]')).map((d) => d.nativeElement as HTMLElement);

    beforeEach(() => {
        fixture = TestBed.createComponent(AccordionHost);
        fixture.detectChanges();
    });

    it('renders the default-open item without playing the open animation', () => {
        const [first] = contents();

        // open by default (data-state) ...
        expect(first.getAttribute('data-state')).toBe('open');
        // ... but the mount animation is suppressed
        expect(first.style.animationName).toBe('none');
        expect(first.hidden).toBe(false);
    });
});
