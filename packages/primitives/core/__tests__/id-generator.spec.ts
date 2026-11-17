import { APP_ID, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxIdGenerator } from '../src/id-generator';

describe('SSR ID ownership', () => {
    it('repeats the same ID sequence in isolated request/client injectors', () => {
        const parent = TestBed.inject(EnvironmentInjector);
        const request = createEnvironmentInjector([RdxIdGenerator, { provide: APP_ID, useValue: 'ng' }], parent);
        const client = createEnvironmentInjector([RdxIdGenerator, { provide: APP_ID, useValue: 'ng' }], parent);
        try {
            const a = request.get(RdxIdGenerator),
                b = client.get(RdxIdGenerator);
            const server = [a.getId('root-'), a.getId('part-'), a.getId('root-')];
            expect([b.getId('root-'), b.getId('part-'), b.getId('root-')]).toEqual(server);
            expect(a.getId('root-')).not.toBe(server[2]);
        } finally {
            request.destroy();
            client.destroy();
        }
    });
    it('keeps applications with distinct APP_ID values unique in one document', () => {
        const parent = TestBed.inject(EnvironmentInjector);
        const first = createEnvironmentInjector([RdxIdGenerator, { provide: APP_ID, useValue: 'first' }], parent);
        const second = createEnvironmentInjector([RdxIdGenerator, { provide: APP_ID, useValue: 'second' }], parent);
        try {
            expect(first.get(RdxIdGenerator).getId('part-')).not.toBe(second.get(RdxIdGenerator).getId('part-'));
        } finally {
            first.destroy();
            second.destroy();
        }
    });
});
