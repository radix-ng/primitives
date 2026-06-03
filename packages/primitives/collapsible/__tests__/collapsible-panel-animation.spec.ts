import { RdxCollapsiblePanelDirective } from '../src/collapsible-panel.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, vi } from 'vitest';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxCollapsibleRootDirective, RdxCollapsiblePanelDirective],
    template: `
        <div rdxCollapsibleRoot [open]="open()">
            <div rdxCollapsiblePanel [hiddenUntilFound]="hiddenUntilFound()" [keepMounted]="keepMounted()">Panel</div>
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
    const renderedPanel = () => fixture.nativeElement.querySelector('[rdxCollapsiblePanel]') as HTMLElement | null;

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

    it('unmounts the closed panel by default', () => {
        create(false);

        expect(renderedPanel()).toBeNull();
        expect(panel().getAttribute('data-closed')).toBe('');
    });

    it('uses hidden="until-found" when hiddenUntilFound is set', () => {
        create(false);
        host.hiddenUntilFound.set(true);
        fixture.detectChanges();

        expect(renderedPanel()).toBe(panel());
        expect(panel().getAttribute('hidden')).toBe('until-found');
    });

    it('keeps the closed panel mounted and hidden when keepMounted is set', () => {
        create(false);
        host.keepMounted.set(true);
        fixture.detectChanges();

        expect(renderedPanel()).toBe(panel());
        expect(panel().getAttribute('hidden')).toBe('');
    });

    it('keeps the panel visible during the exit transition, then hides it', async () => {
        // jsdom reports 0ms CSS durations and lacks the Web Animations API, so the exit transition
        // would otherwise settle synchronously inside `detectChanges()` and the `ending` phase would
        // never be observable. Give the panel a non-zero duration and a controllable running
        // animation so completion lands when we resolve it — mirroring the real `animationend` path.
        const realGetComputedStyle = window.getComputedStyle.bind(window);
        vi.spyOn(window, 'getComputedStyle').mockImplementation((element: Element, pseudoElt?: string | null) => {
            const styles = realGetComputedStyle(element, pseudoElt ?? undefined);
            if (element === panel()) {
                return {
                    transitionDuration: '0.2s',
                    transitionDelay: '0s',
                    animationDuration: '0s',
                    animationDelay: '0s'
                } as CSSStyleDeclaration;
            }
            return styles;
        });

        create(true);
        expect(panel().hidden).toBe(false);

        let finishAnimation!: () => void;
        const finished = new Promise<void>((resolve) => {
            finishAnimation = resolve;
        });
        panel().getAnimations = vi.fn().mockReturnValue([{ finished } as unknown as Animation]);

        // close: the panel stays visible while the exit transition runs
        host.open.set(false);
        fixture.detectChanges();
        expect(panel().getAttribute('hidden')).toBeNull();
        expect(panel().getAttribute('data-ending-style')).toBe('');

        // once the running animation finishes, the panel is hidden. Completion runs through a
        // `Promise.all(finished).then(complete)` microtask chain; a macrotask only fires once that
        // whole chain has drained, so it is the reliable point to flush the resulting render.
        finishAnimation();
        await new Promise<void>((resolve) => setTimeout(resolve));
        await fixture.whenStable();
        fixture.detectChanges();
        expect(renderedPanel()).toBeNull();
        expect(panel().getAttribute('data-ending-style')).toBeNull();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
});
