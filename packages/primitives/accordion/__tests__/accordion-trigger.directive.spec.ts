import { axe } from 'jest-axe';
import { setup } from './test-host';

describe('Accordion Trigger activation', () => {
    it('[APG Accordion][WCAG 4.1.2] defaults to a native non-submit button and native disabled', () => {
        const { triggers, host, fixture, click, root } = setup();
        expect(triggers()[0].getAttribute('type')).toBe('button');
        expect(triggers()[0].getAttribute('role')).toBeNull();
        host.localDisabled.set(true);
        fixture.detectChanges();
        expect((triggers()[0] as HTMLButtonElement).disabled).toBe(true);
        expect(triggers()[0].getAttribute('aria-disabled')).toBeNull();
        click();
        expect(root.value()).toEqual([]);
    });
    it('[WCAG 2.1.1] gives a non-native trigger Enter/Space activation and disabled tab order', () => {
        const { triggers, fixture, root, host } = setup((host) => host.nonNative.set(true));
        const trigger = triggers()[0];
        expect(trigger.tabIndex).toBe(0);
        expect(trigger.getAttribute('role')).toBe('button');
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        fixture.detectChanges();
        expect(root.value()).toEqual(['a']);
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
        fixture.detectChanges();
        expect(root.value()).toEqual(['a']);
        trigger.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }));
        fixture.detectChanges();
        expect(root.value()).toEqual([]);
        host.localDisabled.set(true);
        fixture.detectChanges();
        expect(trigger.tabIndex).toBe(-1);
        expect(trigger.getAttribute('aria-disabled')).toBe('true');
    });
    it('keeps native default prevention separate from request cancellation', () => {
        const { host, click, root } = setup();
        host.preventClick = true;
        click();
        expect(root.value()).toEqual(['a']);
        expect(host.trace.map((entry) => entry.part)).toEqual(['a', 'root']);
    });
    it('[APG Accordion][WCAG 4.1.2] exposes labelled regions without axe violations', async () => {
        const { fixture, click } = setup();
        click();
        expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
    it('registers changed/removed authored IDs and clears the label when destroyed', () => {
        const { triggers, panels, host, fixture } = setup((host) => host.items.set([{ id: 'a', value: 'a' }]));
        const generated = triggers()[0].id;
        host.triggerId.set('authored');
        fixture.detectChanges();
        expect(triggers()[0].id).toBe('authored');
        expect(panels()[0].getAttribute('aria-labelledby')).toBe('authored');
        host.triggerId.set(undefined);
        fixture.detectChanges();
        expect(triggers()[0].id).toBe(generated);
        host.showTrigger.set(false);
        fixture.detectChanges();
        expect(panels()[0].getAttribute('aria-labelledby')).toBeNull();
    });
});
