import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { RdxDialogRef } from '../src/dialog-ref';
import { RdxDialogTriggerDirective } from '../src/dialog-trigger.directive';
import { RdxDialogConfig } from '../src/dialog.config';
import { RdxDialogService } from '../src/dialog.service';

@Component({
    template: `
        <button [rdxDialogTrigger]="dialogTemplate" [rdxDialogConfig]="config">Open Dialog</button>
        <ng-template #dialogTemplate>Dialog Content</ng-template>
    `,
    imports: [RdxDialogTriggerDirective]
})
class TestHostComponent implements OnInit {
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

    config: RdxDialogConfig<unknown>;

    ngOnInit() {
        this.config = {
            content: this.dialogTemplate,
            modal: true,
            ariaLabel: 'Test Dialog',
            autoFocus: 'first-tabbable',
            canClose: () => true,
            canCloseWithBackdrop: true,
            mode: 'default'
        };
    }
}

describe('RdxDialogTriggerDirective', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let directive: RdxDialogTriggerDirective;
    let dialogServiceMock: jest.Mocked<RdxDialogService>;
    let dialogRefMock: jest.Mocked<RdxDialogRef>;

    beforeEach(async () => {
        dialogRefMock = {
            closed$: of(undefined)
        } as any;

        dialogServiceMock = {
            open: jest.fn().mockReturnValue(dialogRefMock)
        } as any;

        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
            providers: [{ provide: RdxDialogService, useValue: dialogServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        const directiveEl = fixture.debugElement.query(By.directive(RdxDialogTriggerDirective));
        directive = directiveEl.injector.get(RdxDialogTriggerDirective);
    });

    it('should create', () => {
        expect(directive).toBeTruthy();
    });

    it('should have correct initial state', () => {
        expect(directive.isOpen()).toBe(false);
        expect(directive.state()).toBe('closed');
    });
});
