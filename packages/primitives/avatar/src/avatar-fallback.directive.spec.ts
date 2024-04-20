import { Component, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RdxAvatarFallbackDirective } from './avatar-fallback.directive';
import { RdxAvatarDirective } from './avatar.directive';

@Component({
    selector: 'rdx-mock-component',
    standalone: true,
    imports: [RdxAvatarFallbackDirective, RdxAvatarDirective],
    template: `
        <div rdxAvatar>
            <span *rdxAvatarFallback>fallback</span>
            <span rdxAvatarFallback>fallback2</span>
        </div>
    `
})
class RdxMockComponent {}

describe('BrnAvatarFallbackDirective', () => {
    let component: RdxMockComponent;
    let fixture: ComponentFixture<RdxMockComponent>;

    beforeEach(() => {
        fixture = TestBed.overrideProvider(PLATFORM_ID, { useValue: 'browser' }).createComponent(
            RdxMockComponent
        );
        component = fixture.componentInstance;
    });

    it('should compile', () => {
        expect(component).toBeTruthy();
    });
});
