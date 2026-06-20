import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxCollapsiblePanelDirective } from '../src/collapsible-panel.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-collapsible-mock-panel',
    standalone: true,
    imports: [RdxCollapsibleRootDirective, RdxCollapsiblePanelDirective],
    template: `
        <div rdxCollapsibleRoot>
            <div rdxCollapsiblePanel>Panel</div>
        </div>
    `
})
class RdxCollapsibleMockComponent {}

describe('RdxCollapsiblePanelDirective', () => {
    let component: RdxCollapsibleMockComponent;
    let fixture: ComponentFixture<RdxCollapsibleMockComponent>;

    beforeEach(() => {
        fixture = TestBed.createComponent(RdxCollapsibleMockComponent);
        component = fixture.componentInstance;
    });

    it('should create an instance', () => {
        expect(component).toBeTruthy();
    });
});
