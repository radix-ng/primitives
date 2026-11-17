import { RdxAccordionItemDirective } from '..';
import { setup } from './test-host';

describe('Accordion Item identity and requests', () => {
    it.each([{}, () => undefined, ['nested']])('uses native identity without serializing or flattening %s', (value) => {
        const { root, click, host, fixture } = setup((host) => host.items.set([{ id: 'a', value }]));
        click();
        expect(root.value()).toHaveLength(1);
        expect(root.value()[0]).toBe(value);
        host.controlled.set([value]);
        fixture.detectChanges();
        expect(root.value()[0]).toBe(value);
        click();
        expect(root.value()[0]).toBe(value); // unaccepted controlled request
    });
    it('assigns distinct stable omitted/nullish values across reorder', () => {
        const { host, fixture, elements, click, root } = setup((host) =>
            host.items.set([{ id: 'a' }, { id: 'b', value: null }])
        );
        const values = () =>
            elements('Item').map((element) => element.injector.get(RdxAccordionItemDirective).resolvedValue());
        const original = values();
        expect(root.value()).toEqual([]);
        expect(original[0]).not.toBe(original[1]);
        click();
        expect(root.value()).toEqual([original[0]]);
        host.items.update((items) => [...items].reverse());
        fixture.detectChanges();
        expect(values()).toEqual([...original].reverse());
    });
    it.each(['item', 'root'])('honors %s veto on opening and closing', (veto) => {
        const { root, host, click } = setup();
        host.cancelItem = veto === 'item';
        host.cancelRoot = veto === 'root';
        click();
        expect(root.value()).toEqual([]);
        expect(host.trace.map((event) => event.part)).toEqual(veto === 'item' ? ['a'] : ['a', 'root']);
        expect(host.values).toEqual([]);
        host.cancelItem = host.cancelRoot = false;
        click();
        host.cancelItem = veto === 'item';
        host.cancelRoot = veto === 'root';
        click();
        expect(root.value()).toEqual(['a']);
    });
    it('emits Item then Root with the same native event/details and no derived sibling notifications', () => {
        const { host, click, fixture, triggers } = setup();
        const event = new MouseEvent('click', { bubbles: true });
        triggers()[0].dispatchEvent(event);
        fixture.detectChanges();
        expect(host.trace.map((entry) => entry.part)).toEqual(['a', 'root']);
        expect(host.trace[0].request.eventDetails).toBe(host.trace[1].request.eventDetails);
        expect(host.trace[0].request.eventDetails.event).toBe(event);
        click(1);
        expect(host.trace.map((entry) => entry.part)).toEqual(['a', 'root', 'b', 'root']);
        host.controlled.set([]);
        fixture.detectChanges();
        expect(host.trace).toHaveLength(4);
    });
});
