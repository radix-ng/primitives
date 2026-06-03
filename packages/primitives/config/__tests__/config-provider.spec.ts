import { RadixNG } from '../src/config';
import { provideRadixNG, RADIX_NG_CONFIG } from '../src/config.provider';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';

describe('provideRadixNG', () => {
    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('collects configs through the config token and applies them to RadixNG', () => {
        TestBed.configureTestingModule({
            providers: [provideRadixNG({ dir: 'rtl' }), provideRadixNG({ locale: 'ar-EG' })]
        });

        const configs = TestBed.inject(RADIX_NG_CONFIG);
        const radix = TestBed.inject(RadixNG);

        expect(configs).toEqual([{ dir: 'rtl' }, { locale: 'ar-EG' }]);
        expect(radix.dir()).toBe('rtl');
        expect(radix.locale()).toBe('ar-EG');
    });
});
