import { Component, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxAvatarFallbackDirective } from '../src/avatar-fallback.directive';
import { RdxAvatarRootDirective } from '../src/avatar-root.directive';

@Component({
    selector: 'rdx-mock-component',
    standalone: true,
    imports: [RdxAvatarFallbackDirective, RdxAvatarRootDirective],
    template: `
        <span rdxAvatarRoot>
            <span [rdxDelayMs]="delay" rdxAvatarFallback>fallback</span>
            <span rdxAvatarFallback>fallback2</span>
        </span>
    `
})
class RdxMockComponent {
    delay = 1000;
}

describe('RdxAvatarFallbackDirective', () => {
    let component: RdxMockComponent;
    let fixture: ComponentFixture<RdxMockComponent>;

    beforeEach(() => {
        fixture = TestBed.overrideProvider(PLATFORM_ID, { useValue: 'browser' }).createComponent(RdxMockComponent);
        component = fixture.componentInstance;
    });

    it('should compile', () => {
        expect(component).toBeTruthy();
    });

    it('should hide fallback initially', () => {
        fixture.detectChanges();
        const fallbackElement = fixture.debugElement.query(By.css('span[rdxAvatarFallback]'));
        expect(fallbackElement.nativeElement.style.display).toBe('none');
    });

    it('should show fallback after delay', fakeAsync(() => {
        fixture.detectChanges();

        tick(1000);
        fixture.detectChanges();

        const fallbackElement = fixture.debugElement.query(By.css('span[rdxAvatarFallback]'));
        expect(fallbackElement.nativeElement.style.display).not.toBe('none');
    }));
});
