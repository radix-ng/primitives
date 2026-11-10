import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Menu } from '@base-ui/react/menu';
import { Menubar } from '@base-ui/react/menubar';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { changeCollection, type MenuEntry } from '../../../shared/menu-collection';
import { menuClasses as s } from '../../../shared/menu-fixture';
import { MenuItems } from '../../../shared/menu-items';
import { config, installProbe, type Layer } from './contract';
const settings = config(),
    trace = installProbe('react');
function ReactMenubar() {
    const [menus, setMenus] = useState<MenuEntry<Layer>[]>([
        { id: 'file', label: 'file', disabled: false },
        { id: 'blocked', label: 'blocked', disabled: true },
        { id: 'edit', label: 'edit', disabled: false }
    ]);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (event.key === 'F3' && settings.name.startsWith('collection-')) {
                event.preventDefault();
                setMenus((items) =>
                    changeCollection(
                        items,
                        settings.name,
                        { id: 'new', label: 'new', disabled: false },
                        settings.name === 'collection-disable' ? 'edit' : undefined
                    )
                );
            }
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    return (
        <DirectionProvider direction={settings.dir}>
            <div className={s.layout + ' w-96!'}>
                <input data-testid="before" aria-label="Before menubar" className={s.outside} />
                <Menubar aria-label="Application" className="flex gap-2" disabled={settings.disabled}>
                    {menus.map((entry) => {
                        const menu = entry.id;
                        return (
                            <Menu.Root
                                key={menu}
                                disabled={entry.disabled}
                                onOpenChange={(open, details) => {
                                    if (
                                        (open && settings.name === 'cancel-open') ||
                                        (!open && settings.name === 'cancel-close')
                                    )
                                        details.cancel();
                                    trace.change(
                                        menu,
                                        open,
                                        details.reason,
                                        details.isCanceled,
                                        details.event,
                                        details.trigger
                                    );
                                }}
                                onOpenChangeComplete={(open) => trace.complete(menu, open)}
                            >
                                <Menu.Trigger
                                    id={`${menu}-trigger`}
                                    data-testid={`${menu}-trigger`}
                                    data-menu-trigger={menu}
                                    className={s.trigger}
                                >
                                    {entry.label}
                                </Menu.Trigger>
                                <Menu.Portal keepMounted={settings.keepMounted}>
                                    <Menu.Positioner className="z-50" side={settings.side} align="start" sideOffset={4}>
                                        <Menu.Popup
                                            id={`${menu}-popup`}
                                            className={s.popup}
                                            data-testid={`${menu}-popup`}
                                            data-menu-popup={menu}
                                        >
                                            <MenuItems menu={menu} select={trace.select} />
                                        </Menu.Popup>
                                    </Menu.Positioner>
                                </Menu.Portal>
                            </Menu.Root>
                        );
                    })}
                </Menubar>
                <button
                    type="button"
                    data-testid="outside"
                    className={s.outside + ' fixed start-24 top-[30rem]'}
                    onClick={() => trace.probe.activations++}
                >
                    Outside
                </button>
            </div>
        </DirectionProvider>
    );
}
createRoot(document.getElementById('root')!).render(<ReactMenubar />);
