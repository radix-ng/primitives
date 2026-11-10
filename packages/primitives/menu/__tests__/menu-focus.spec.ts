import { getDomMenuItems, getFocusableMenuItems } from '../src/menu-focus';

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
