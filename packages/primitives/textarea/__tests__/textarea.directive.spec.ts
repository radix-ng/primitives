import { CommonModule } from '@angular/common';
import { Component, Provider, Type } from '@angular/core';
import {
    ComponentFixture,
    ComponentFixtureAutoDetect,
    fakeAsync,
    TestBed,
    tick
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { RdxTextareaDirective } from '../src/textarea.directive';

function createComponent<T>(
    component: Type<T>,
    imports: any[] = [],
    providers: Provider[] = []
): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [FormsModule, RdxTextareaDirective, CommonModule, ...imports],
        declarations: [component],
        providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }, ...providers]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}

@Component({
    template: `
        <form>
            <textarea
                rdxTextarea
                [(ngModel)]="value"
                [placeholder]="placeholder"
                [disabled]="disabled"
                [ngModelOptions]="{ standalone: true }"
            ></textarea>
        </form>
    `
})
class RdxTextareaForBehaviorsComponent {
    value = 'test\ntest\ntest';
    placeholder: string | undefined;
    disabled = false;
}

describe('Textarea', () => {
    describe('basic behaviors', () => {
        it('should change state "disable"', fakeAsync(() => {
            const fixture = createComponent(RdxTextareaForBehaviorsComponent);
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(
                By.directive(RdxTextareaDirective)
            ).nativeElement;

            expect(textareaElement.disabled).toBe(false);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(textareaElement.disabled).toBe(true);
            });
        }));

        it('should has placeholder', fakeAsync(() => {
            const fixture = createComponent(RdxTextareaForBehaviorsComponent);
            fixture.detectChanges();

            tick();

            const testComponent = fixture.debugElement.componentInstance;

            const textareaElement = fixture.debugElement.query(
                By.directive(RdxTextareaDirective)
            ).nativeElement;

            expect(textareaElement.getAttribute('placeholder')).toBe(null);

            testComponent.placeholder = 'placeholder';
            fixture.detectChanges();

            expect(textareaElement.getAttribute('placeholder')).toBe('placeholder');

            testComponent.placeholder = '';
            fixture.detectChanges();

            expect(textareaElement.getAttribute('placeholder')).toBe('');
        }));
    });
});
