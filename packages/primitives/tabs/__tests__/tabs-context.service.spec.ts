import { TestBed } from '@angular/core/testing';

import { TabsContextService } from '../src/tabs-context.service';

describe('TabsContextService', () => {
    let service: TabsContextService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TabsContextService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should generate a base ID', () => {
        const baseId = service.getBaseId();
        expect(baseId).toMatch(/^tabs-/);
    });

    it('should set and get the value correctly', () => {
        service.setValue('test');
        expect(service.value$()).toBe('test');
    });

    it('should set and get the orientation correctly', () => {
        service.setOrientation('vertical');
        expect(service.orientation$()).toBe('vertical');
    });

    it('should set and get the direction correctly', () => {
        service.setDir('rtl');
        expect(service.dir$()).toBe('rtl');
    });
});
