import { Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxCollapsiblePanelDirective } from '../src/collapsible-panel.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';

@Component({
    imports: [RdxCollapsibleRootDirective, RdxCollapsiblePanelDirective],
    template: `
        <div [open]="open()" rdxCollapsibleRoot>
            <div [hiddenUntilFound]="hiddenUntilFound()" [keepMounted]="keepMounted()" rdxCollapsiblePanel>Panel</div>
        </div>
    `
})
class Host {
    readonly open = signal(false);
    readonly hiddenUntilFound = signal<boolean | undefined>(undefined);
    readonly keepMounted = signal<boolean | undefined>(undefined);
}

describe('RdxCollapsiblePanel — mount + transition', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const panel = () => fixture.debugElement.query(By.css('[rdxCollapsiblePanel]')).nativeElement as HTMLElement;

    function create(open: boolean) {
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        host.open.set(open);
        fixture.detectChanges();
    }

    it('suppresses the animation when mounting already open', () => {
        create(true);

        // first (mount) measurement leaves animations disabled — no open animation plays
        expect(panel().style.animationName).toBe('none');
        expect(panel().hidden).toBe(false);
        expect(panel().getAttribute('data-open')).toBe('');
    });

    it('re-enables the animation for a toggle after mount', () => {
        create(false);

        host.open.set(true);
        fixture.detectChanges();

        // the original (empty) animation-name is restored, so the CSS animation can run
        expect(panel().style.animationName).toBe('');
    });

    it('hides the closed panel with a plain hidden attribute by default', () => {
        create(false);

        expect(panel().getAttribute('hidden')).toBe('');
        expect(panel().getAttribute('data-closed')).toBe('');
    });

    it('uses hidden="until-found" when hiddenUntilFound is set', () => {
        create(false);
        host.hiddenUntilFound.set(true);
        fixture.detectChanges();

        expect(panel().getAttribute('hidden')).toBe('until-found');
    });

    it('keeps the closed panel visible (no hidden) when keepMounted is set', () => {
        create(false);
        host.keepMounted.set(true);
        fixture.detectChanges();

        expect(panel().getAttribute('hidden')).toBeNull();
    });

    it('keeps the panel visible during the exit transition, then hides it', fakeAsync(() => {
        create(true);
        expect(panel().hidden).toBe(false);

        // close: the panel stays visible while the exit transition runs
        host.open.set(false);
        fixture.detectChanges();
        expect(panel().getAttribute('hidden')).toBeNull();
        expect(panel().getAttribute('data-ending-style')).toBe('');

        // once the transition completes, the panel is hidden
        flush();
        fixture.detectChanges();
        expect(panel().getAttribute('hidden')).toBe('');
        expect(panel().getAttribute('data-ending-style')).toBeNull();
    }));
});
