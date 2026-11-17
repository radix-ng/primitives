import { setup } from './test-host';

describe('Accordion Root value ownership', () => {
    it('uses an array in single mode, including close and switching', () => {
        const { root, click } = setup();
        expect(root.value()).toEqual([]);
        click();
        expect(root.value()).toEqual(['a']);
        click(1);
        expect(root.value()).toEqual(['b']);
        click(1);
        expect(root.value()).toEqual([]);
    });
    it.each([false, true])('controlled arrays win over defaults (multiple=%s)', (multiple) => {
        const { root, host, click, fixture } = setup((host) => {
            host.controlled.set(['b']);
            host.defaults.set(['a']);
            host.multiple.set(multiple);
        });
        expect(root.value()).toEqual(['b']);
        click();
        expect(root.value()).toEqual(['b']);
        expect(host.values).toEqual([multiple ? ['b', 'a'] : ['a']]);
        host.controlled.set([]);
        fixture.detectChanges();
        expect(root.value()).toEqual([]);
    });
    it('snapshots defaults once and ignores subsequent or late defaults', () => {
        const { root, host, fixture, click } = setup((host) => host.defaults.set(['a']));
        host.defaults.set(['b']);
        fixture.detectChanges();
        expect(root.value()).toEqual(['a']);
        click();
        expect(root.value()).toEqual([]);
        host.defaults.set(['a']);
        fixture.detectChanges();
        expect(root.value()).toEqual([]);
        const late = setup();
        late.host.defaults.set(['a']);
        late.fixture.detectChanges();
        expect(late.root.value()).toEqual([]);
    });
    it('keeps the array when modes change; the next toggle applies the new mode', () => {
        const { root, host, fixture, click } = setup((host) => {
            host.multiple.set(true);
            host.defaults.set(['a', 'b']);
        });
        host.multiple.set(false);
        fixture.detectChanges();
        expect(root.value()).toEqual(['a', 'b']);
        click(1);
        expect(root.value()).toEqual(['b']);
    });
});
