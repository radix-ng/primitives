import { getDomMenuItems, getFocusableMenuItems, getMenuInitialFocusItem } from '../src/menu-focus';

describe('Menu semantic DOM fallback', () => {
    it('finds composed item hosts within their own semantic menu boundary', () => {
        const popup = document.createElement('div');
        popup.setAttribute('role', 'menu');
        popup.innerHTML = `
            <button role="menuitem" id="first">First</button>
            <button role="menuitemcheckbox" id="check">Checked</button>
            <div role="menu"><button role="menuitem" id="nested">Child</button></div>
        `;
        expect(getFocusableMenuItems(popup).map((item) => item.id)).toEqual(['first', 'check']);
        expect(getDomMenuItems(popup).map((item) => item.metadata.type)).toEqual(['regular-item', 'checkbox-item']);
    });

    it('prefers enabled edges on initial entry while retaining disabled items for arrows', () => {
        const popup = document.createElement('div');
        popup.setAttribute('role', 'menu');
        popup.innerHTML = `
            <button role="menuitem" aria-disabled="true" id="first">Disabled first</button>
            <div role="menuitem" data-disabled id="custom">Disabled custom</div>
            <a role="menuitem" href="#" id="enabled">Enabled</a>
            <button role="menuitem" disabled id="last">Disabled last</button>
            <div role="menu"><button role="menuitem">Nested enabled</button></div>
        `;
        expect(getMenuInitialFocusItem(popup)?.id).toBe('enabled');
        expect(getMenuInitialFocusItem(popup, 'last')?.id).toBe('enabled');
        expect(getFocusableMenuItems(popup)).toHaveLength(4);
        popup.querySelector('#enabled')!.setAttribute('aria-disabled', 'true');
        expect(getMenuInitialFocusItem(popup)).toBeUndefined();
    });

    it('preserves submenu semantics when its trigger renders as a link', () => {
        const popup = document.createElement('div');
        popup.setAttribute('role', 'menu');
        popup.innerHTML = `
            <a role="menuitem" aria-haspopup="menu" href="#" rdxMenuSubTrigger>Declared submenu</a>
            <a role="menuitem" aria-haspopup="menu" href="#">Composed submenu</a>
            <a role="menuitem" href="#">Link</a>
        `;
        expect(getDomMenuItems(popup).map((item) => item.metadata.type)).toEqual([
            'submenu-trigger',
            'submenu-trigger',
            'link-item'
        ]);
    });
});
