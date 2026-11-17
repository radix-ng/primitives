import { setup } from './test-host';

describe('Accordion Panel policy and reveal', () => {
    it('settles a non-animated opening without transient collapsed styling or pixel sizes', () => {
        const { fixture, panels, click } = setup();
        click();
        fixture.detectChanges();
        const panel = panels()[0];
        expect(panel.hasAttribute('data-starting-style')).toBe(false);
        expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('auto');
        expect(panel.style.getPropertyValue('--collapsible-panel-width')).toBe('auto');
    });
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
    it.each([false, true])(
        'suppresses motion in the beforematch task and restores authored styles (inline: %s)',
        (inline) => {
            const { fixture, panels, click } = setup((host) => host.findable.set(true));
            const panel = panels()[0];
            if (inline) {
                panel.style.setProperty('animation-duration', '2s', 'important');
                panel.style.setProperty('transition-duration', '3s', 'important');
            }
            panel.dispatchEvent(new Event('beforematch'));
            // This precedes Angular rendering and the browser's own hidden removal/measurement.
            expect(panel.style.animationDuration).toBe('0s');
            expect(panel.style.transitionDuration).toBe('0s');
            expect(panel.hasAttribute('data-starting-style')).toBe(false);
            panel.removeAttribute('hidden');
            fixture.detectChanges();
            click();
            expect(panel.style.animationDuration).toBe(inline ? '2s' : '');
            expect(panel.style.transitionDuration).toBe(inline ? '3s' : '');
            expect(panel.style.getPropertyPriority('animation-duration')).toBe(inline ? 'important' : '');
            expect(panel.style.getPropertyPriority('transition-duration')).toBe(inline ? 'important' : '');
        }
    );
    it('restores both temporary motion styles when destroyed before a controlled reveal commits', () => {
        const { fixture, panels } = setup((host) => {
            host.findable.set(true);
            host.controlled.set([]);
        });
        const panel = panels()[0];
        panel.style.setProperty('animation-duration', '2s', 'important');
        panel.dispatchEvent(new Event('beforematch'));
        expect(panel.style.animationDuration).toBe('0s');
        fixture.destroy();
        expect(panel.style.animationDuration).toBe('2s');
        expect(panel.style.getPropertyPriority('animation-duration')).toBe('important');
        expect(panel.style.transitionDuration).toBe('');
    });
    it('restores pending reveal styles when search is disabled before a controlled request commits', async () => {
        const { host, fixture, panels } = setup((host) => {
            host.findable.set(true);
            host.controlled.set([]);
        });
        const panel = panels()[0];
        panel.style.setProperty('animation-duration', '2s', 'important');
        panel.dispatchEvent(new Event('beforematch'));
        host.findable.set(false);
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve, 0));
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        fixture.detectChanges();
        expect(panel.getAttribute('hidden')).toBe('');
        expect(panel.style.animationDuration).toBe('2s');
        expect(panel.style.getPropertyPriority('animation-duration')).toBe('important');
        expect(panel.style.transitionDuration).toBe('');
    });
    it.each(['item', 'root', 'controlled'])('restores browser reveal after %s refusal', async (refusal) => {
        const { host, fixture, root, panels } = setup((host) => {
            host.findable.set(true);
            if (refusal === 'controlled') host.controlled.set([]);
        });
        host.cancelItem = refusal === 'item';
        host.cancelRoot = refusal === 'root';
        const panel = panels()[0];
        panel.style.setProperty('animation-duration', '2s', 'important');
        panel.style.setProperty('transition-duration', '3s', 'important');
        panel.dispatchEvent(new Event('beforematch'));
        panel.removeAttribute('hidden'); // browser removes this after dispatch
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve, 0));
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        fixture.detectChanges();
        expect(root.value()).toEqual([]);
        expect(panel.getAttribute('hidden')).toBe('until-found');
        expect(panel.style.animationDuration).toBe('2s');
        expect(panel.style.transitionDuration).toBe('3s');
        expect(panel.style.getPropertyPriority('animation-duration')).toBe('important');
        expect(panel.style.getPropertyPriority('transition-duration')).toBe('important');
        expect(host.trace).toHaveLength(refusal === 'item' ? 1 : 2);
    });
});
