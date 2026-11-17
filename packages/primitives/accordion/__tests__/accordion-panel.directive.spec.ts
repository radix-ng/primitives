import { setup } from './test-host';

describe('Accordion Panel policy and reveal', () => {
    it('lets explicit false override root search policy and restores inheritance on removal', () => {
        const { host, fixture, panels } = setup((host) => {
            host.findable.set(true);
            host.panelFindable.set(false);
        });
        expect(panels()[0].getAttribute('hidden')).toBe('');
        host.panelFindable.set(undefined);
        fixture.detectChanges();
        expect(panels()[0].getAttribute('hidden')).toBe('until-found');
    });
    it('registers dynamic authored panel IDs for open-only controls', () => {
        const { host, fixture, triggers, panels, click } = setup();
        host.panelId.set('authored-panel');
        fixture.detectChanges();
        expect(panels()[0].id).toBe('authored-panel');
        expect(triggers()[0].getAttribute('aria-controls')).toBeNull();
        click();
        expect(triggers()[0].getAttribute('aria-controls')).toBe('authored-panel');
        host.panelId.set('next-panel');
        fixture.detectChanges();
        expect(triggers()[0].getAttribute('aria-controls')).toBe('next-panel');
    });
    it('clears controls on conditional panel removal and restores the generated ID', () => {
        const { host, fixture, triggers, panels, click } = setup();
        const generated = panels()[0].id;
        click();
        host.showPanel.set(false);
        fixture.detectChanges();
        expect(triggers()[0].getAttribute('aria-controls')).toBeNull();
        host.showPanel.set(true);
        fixture.detectChanges();
        expect(panels()[0].id).toBe(generated);
        expect(triggers()[0].getAttribute('aria-controls')).toBe(generated);
    });
    it('routes beforematch through Item and Root, closing a single-mode sibling', () => {
        const { host, fixture, root, panels, triggers } = setup((host) => {
            host.findable.set(true);
            host.defaults.set(['b']);
        });
        const event = new Event('beforematch');
        panels()[0].dispatchEvent(event);
        fixture.detectChanges();
        expect(root.value()).toEqual(['a']);
        expect(triggers().map((trigger) => trigger.getAttribute('aria-expanded'))).toEqual(['true', 'false']);
        expect(host.trace.map((entry) => entry.part)).toEqual(['a', 'root']);
        expect(host.trace[0].request.eventDetails.event).toBe(event);
        expect(host.trace[0].request.eventDetails.reason).toBe('none');
        expect(host.trace[0].request.eventDetails).toBe(host.trace[1].request.eventDetails);
    });
    it.each(['item', 'root', 'controlled'])('restores browser reveal after %s refusal', async (refusal) => {
        const { host, fixture, root, panels } = setup((host) => {
            host.findable.set(true);
            if (refusal === 'controlled') host.controlled.set([]);
        });
        host.cancelItem = refusal === 'item';
        host.cancelRoot = refusal === 'root';
        const panel = panels()[0];
        panel.dispatchEvent(new Event('beforematch'));
        panel.removeAttribute('hidden'); // browser removes this after dispatch
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(root.value()).toEqual([]);
        expect(panel.getAttribute('hidden')).toBe('until-found');
        expect(host.trace).toHaveLength(refusal === 'item' ? 1 : 2);
    });
});
