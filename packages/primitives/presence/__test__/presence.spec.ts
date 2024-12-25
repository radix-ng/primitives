import { NgZone } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PresenceComponent } from './presence-test.component';

describe('presence', () => {
    let component: PresenceComponent;
    let fixture: ComponentFixture<PresenceComponent>;
    let zone: NgZone;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PresenceComponent],
            providers: [{ provide: NgZone, useValue: new NgZone({ enableLongStackTrace: false }) }]
        }).compileComponents();

        fixture = TestBed.createComponent(PresenceComponent);
        component = fixture.componentInstance;
        zone = TestBed.inject(NgZone);

        fixture.detectChanges(); // triggers ngOnInit
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize element and context correctly', () => {
        const element = fixture.debugElement.query(By.css('div')).nativeElement;

        const context = component.getContext();

        expect(component['element']).toBe(element);
        expect(context).toEqual({ direction: 'show', dimension: 'height', maxSize: '0px' });
    });

    it('should complete animation correctly', fakeAsync(() => {
        const element = fixture.debugElement.query(By.css('div')).nativeElement;

        zone.runOutsideAngular(() => {
            element.dispatchEvent(new Event('transitionend'));
        });

        tick(600);
        fixture.detectChanges();

        expect(element.classList.contains('collapsing')).toBe(false);
        expect(element.classList.contains('show')).toBe(true);
    }));
});
