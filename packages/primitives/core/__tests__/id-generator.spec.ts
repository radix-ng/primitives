import {
    APP_ID,
    createEnvironmentInjector,
    ElementRef,
    EnvironmentInjector,
    makeStateKey,
    PLATFORM_ID,
    runInInjectionContext,
    TransferState
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectId, RdxIdGenerator } from '../src/id-generator';

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

    it('recovers each native owner when islands hydrate out of server order', () => {
        const parent = TestBed.inject(EnvironmentInjector);
        const server = createEnvironmentInjector(
            [
                RdxIdGenerator,
                TransferState,
                { provide: APP_ID, useValue: 'ng' },
                { provide: PLATFORM_ID, useValue: 'server' }
            ],
            parent
        );
        const client = createEnvironmentInjector(
            [
                RdxIdGenerator,
                TransferState,
                { provide: APP_ID, useValue: 'ng' },
                { provide: PLATFORM_ID, useValue: 'browser' }
            ],
            parent
        );
        const allocate = (environment: EnvironmentInjector, element: Element) => {
            const owner = createEnvironmentInjector(
                [{ provide: ElementRef, useValue: new ElementRef(element) }],
                environment
            );
            try {
                return runInInjectionContext(owner, () => injectId('part-'));
            } finally {
                owner.destroy();
            }
        };
        try {
            const first = document.createElement('div');
            const second = document.createElement('div');
            const firstId = allocate(server, first);
            const secondId = allocate(server, second);
            const repeated = allocate(server, first);
            const serialized: Record<string, unknown> = JSON.parse(server.get(TransferState).toJson());
            for (const [key, value] of Object.entries(serialized))
                client.get(TransferState).set(makeStateKey(key), value);
            // New client content must also avoid IDs of server owners that have not hydrated.
            const fresh = allocate(client, document.createElement('div'));
            expect([firstId, secondId, repeated]).not.toContain(fresh);
            expect(allocate(client, second)).toBe(secondId);
            expect(allocate(client, first)).toBe(firstId);
            expect(allocate(client, first)).toBe(repeated);
            expect(client.get(RdxIdGenerator).getId('part-')).not.toBe(fresh);
        } finally {
            server.destroy();
            client.destroy();
        }
    });
});
