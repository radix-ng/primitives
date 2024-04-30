import { Component, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RdxAvatarFallbackDirective } from '../src/avatar-fallback.directive';
import { RdxAvatarRootDirective } from '../src/avatar-root.directive';

@Component({
    selector: 'rdx-mock-component',
    standalone: true,
    imports: [RdxAvatarFallbackDirective, RdxAvatarRootDirective],
    template: `
        <span AvatarRoot>
            <span AvatarFallback>fallback</span>
            <span AvatarFallback>fallback2</span>
        </span>
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
