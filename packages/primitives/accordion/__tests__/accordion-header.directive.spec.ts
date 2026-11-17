import { setup } from './test-host';

describe('Accordion state attributes', () => {
    it('exposes index zero, orientation, hidden and closed state on all item parts', () => {
        const { elements, click } = setup();
        for (const part of ['Item', 'Header', 'Trigger', 'Panel']) {
            const element = elements(part)[0].nativeElement as HTMLElement;
            expect(element.getAttribute('data-index')).toBe('0');
            expect(element.getAttribute('data-orientation')).toBe('vertical');
            expect(element.hasAttribute('data-hidden')).toBe(true);
            expect(element.hasAttribute('data-closed')).toBe(part !== 'Trigger');
        }
        click();
        for (const part of ['Item', 'Header', 'Trigger', 'Panel']) {
            const element = elements(part)[0].nativeElement as HTMLElement;
            expect(element.hasAttribute('data-hidden')).toBe(false);
            expect(element.hasAttribute('data-closed')).toBe(false);
        }
    });
});
