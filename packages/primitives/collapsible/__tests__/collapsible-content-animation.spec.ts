import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxCollapsibleContentDirective } from '../src/collapsible-content.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';

@Component({
    imports: [RdxCollapsibleRootDirective, RdxCollapsibleContentDirective],
    template: `
        <div [open]="open()" rdxCollapsibleRoot>
            <div rdxCollapsibleContent>Content</div>
        </div>
    `
})
class Host {
    readonly open = signal(false);
}

describe('RdxCollapsibleContent — mount animation', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const content = () => fixture.debugElement.query(By.css('[rdxCollapsibleContent]')).nativeElement as HTMLElement;

    function create(open: boolean) {
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        host.open.set(open);
        fixture.detectChanges();
    }

    it('suppresses the animation when mounting already open', () => {
        create(true);

        // first (mount) measurement leaves animations disabled — no open animation plays
        expect(content().style.animationName).toBe('none');
        expect(content().hidden).toBe(false);
    });

    it('re-enables the animation for a toggle after mount', () => {
        create(false);

        host.open.set(true);
        fixture.detectChanges();

        // the original (empty) animation-name is restored, so the CSS animation can run
        expect(content().style.animationName).toBe('');
    });

    it('keeps the content hidden while closed', () => {
        create(false);

        expect(content().getAttribute('hidden')).toBe('until-found');
    });

    it('hides the content after a transition-based close completes', () => {
        create(true);
        expect(content().hidden).toBe(false);

        // close: the content stays visible while the exit transition runs
        host.open.set(false);
        fixture.detectChanges();
        expect(content().getAttribute('hidden')).toBeNull();

        // when the transition ends, the content is hidden
        content().dispatchEvent(new Event('transitionend'));
        fixture.detectChanges();
        expect(content().getAttribute('hidden')).toBe('until-found');
    });
});
