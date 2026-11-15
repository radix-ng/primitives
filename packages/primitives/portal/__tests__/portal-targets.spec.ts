import { Component, Directive, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { RdxPortal, RdxPortalPresence, type RdxPortalContainer } from '../index';

@Directive({
    selector: 'ng-template[targetPortal]',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }]
})
class TargetPortal {}

@Component({
    imports: [RdxPortal, TargetPortal],
    providers: [provideRdxPresenceContext(() => ({ present: inject(Targets).present }))],
    template: `
        <div id="origin">
            @if (show()) {
                <span id="attribute" [container]="target()" rdxPortal>
                    <input id="attribute-input" value="State" />
                </span>
            }
            <ng-template [container]="target()" targetPortal>
                <button id="structural">Structural</button>
                <span id="second">Second root</span>
            </ng-template>
        </div>
    `
})
class Targets {
    readonly target = signal<RdxPortalContainer | undefined>(undefined);
    readonly present = signal(true);
    readonly show = signal(true);
}

describe('shared Portal destinations', () => {
    it.each(['shadow', 'iframe'] as const)(
        'moves both portals to %s, retargets the same nodes and cleans up',
        async (kind) => {
            TestBed.configureTestingModule({ imports: [Targets] });
            const frame = document.createElement('iframe');
            const host = document.createElement('div');
            document.body.append(frame, host);
            const first = kind === 'shadow' ? host.attachShadow({ mode: 'open' }) : frame.contentDocument!.body;
            const second = document.createElement('div');
            document.body.append(second);
            const fixture = TestBed.createComponent(Targets);
            try {
                fixture.componentInstance.target.set(first);
                await fixture.whenStable();
                const nodes = ['attribute', 'structural', 'second'].map((id) => first.querySelector(`#${id}`));
                expect(nodes.every(Boolean)).toBe(true);
                expect(nodes.map((node) => node?.parentNode)).toEqual([first, first, first]);
                const input = first.querySelector<HTMLInputElement>('#attribute-input')!;
                input.value = 'Edited';
                input.focus();
                fixture.componentInstance.target.set(second);
                await fixture.whenStable();
                expect(['attribute', 'structural', 'second'].map((id) => second.querySelector(`#${id}`))).toEqual(
                    nodes
                );
                expect(input.ownerDocument.activeElement).toBe(input);
                expect(input.value).toBe('Edited');
                const button = second.querySelector<HTMLButtonElement>('#structural')!;
                button.focus();
                fixture.componentInstance.target.set(first);
                await fixture.whenStable();
                expect((button.getRootNode() as Document | ShadowRoot).activeElement).toBe(button);
                fixture.componentInstance.present.set(false);
                fixture.componentInstance.show.set(false);
                await fixture.whenStable();
                expect(first.querySelector('#attribute, #structural, #second')).toBeNull();
            } finally {
                fixture.destroy();
                frame.remove();
                host.remove();
                second.remove();
            }
        }
    );
});
