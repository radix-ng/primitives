import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxAccordionItemDirective } from '../src/accordion-item.directive';
import { RdxAccordionPanelDirective } from '../src/accordion-panel.directive';
import { RdxAccordionRootDirective } from '../src/accordion-root.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxAccordionRootDirective, RdxAccordionItemDirective, RdxAccordionPanelDirective],
    template: `
        <div [defaultValue]="'one'" rdxAccordionRoot>
            <div value="one" rdxAccordionItem>
                <div rdxAccordionPanel>Content one</div>
            </div>
            <div value="two" rdxAccordionItem>
                <div rdxAccordionPanel>Content two</div>
            </div>
        </div>
    `
})
class AccordionHost {}

describe('RdxAccordion — mount animation', () => {
    let fixture: ComponentFixture<AccordionHost>;

    const contents = () =>
        fixture.debugElement.queryAll(By.css('[rdxAccordionPanel]')).map((d) => d.nativeElement as HTMLElement);

    beforeEach(() => {
        fixture = TestBed.createComponent(AccordionHost);
        fixture.detectChanges();
    });

    it('renders the default-open item without playing the open animation', () => {
        const [first] = contents();

        // open by default (data-open) ...
        expect(first.getAttribute('data-open')).toBe('');
        // ... but the mount animation is suppressed
        expect(first.style.animationName).toBe('none');
        expect(first.hidden).toBe(false);
    });
});
