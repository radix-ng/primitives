import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { RdxDialogContentDirective } from '../src/dialog-content.directive';
import { RdxDialogRef } from '../src/dialog-ref';

@Component({
    template: '<div rdxDialogContent>Dialog Content</div>',
    imports: [RdxDialogContentDirective]
})
class TestComponent {}

describe('RdxDialogContentDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let directiveElement: DebugElement;
    let directive: RdxDialogContentDirective;
    let dialogRefMock: jest.Mocked<RdxDialogRef>;
    let closedSubject: Subject<any>;

    beforeEach(async () => {
        closedSubject = new Subject();
        dialogRefMock = {
            closed$: closedSubject.asObservable(),
            close: jest.fn(),
            dismiss: jest.fn()
        } as any;

        await TestBed.configureTestingModule({
            imports: [TestComponent],
            providers: [{ provide: RdxDialogRef, useValue: dialogRefMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        directiveElement = fixture.debugElement.query(By.directive(RdxDialogContentDirective));
        directive = directiveElement.injector.get(RdxDialogContentDirective);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(directive).toBeTruthy();
    });

    it('should have correct initial state', () => {
        expect(directive['state']()).toBe('open');
    });

    it('should update state when dialog is closed', () => {
        closedSubject.next(undefined);
        fixture.detectChanges();
        expect(directive['state']()).toBe('closed');
    });

    it('should call dialogRef.dismiss when dismiss method is called', () => {
        directive.dismiss();
        expect(dialogRefMock.dismiss).toHaveBeenCalled();
    });

    it('should call dialogRef.dismiss when dismiss method is called', () => {
        directive.dismiss();
        expect(dialogRefMock.dismiss).toHaveBeenCalled();
    });

    it('should have correct host bindings', () => {
        const element = directiveElement.nativeElement;
        expect(element.getAttribute('role')).toBe('dialog');
        expect(element.getAttribute('aria-describedby')).toBe('true');
        expect(element.getAttribute('aria-labelledby')).toBe('true');
        expect(element.getAttribute('data-state')).toBe('open');

        closedSubject.next(undefined);
        fixture.detectChanges();

        expect(element.getAttribute('data-state')).toBe('closed');
    });
});
