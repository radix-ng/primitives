import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Menu } from '@base-ui/react/menu';
import { Menubar } from '@base-ui/react/menubar';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { changeCollection, type MenuEntry } from '../../../shared/menu-collection';
import { MenuItems } from '../../../shared/menu-items';
import { rootRemovalExitClass, rootRemovalFinalFocus } from '../../../shared/root-removal';
import { cancelChange } from './composition';
import { config, initialMenus, installProbe, submenuId, type TopLayer } from './contract';
import { menubarClasses } from './orientation';
import { changeExternalOpen, initialOpenState } from './state';
const settings = config(),
    trace = installProbe('react'),
    s = menubarClasses(settings);
function ReactMenubar() {
    const [rootPresent, setRootPresent] = useState(true);
    const [beforePresent, setBeforePresent] = useState(true);
    const exit = settings.removal?.animated ? rootRemovalExitClass : '';
    const [menus, setMenus] = useState<MenuEntry<TopLayer>[]>(initialMenus(settings.name));
    const [allowSwitch, setAllowSwitch] = useState(false);
    const [open, setOpen] = useState(initialOpenState(settings.name));
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (settings.removal && ['F3', 'F4'].includes(event.key)) {
                event.preventDefault();
                setRootPresent(event.key === 'F4');
                if (event.key === 'F3' && settings.removal.missingFocus) setBeforePresent(false);
                return;
            }
            if (settings.controlled && ['F6', 'F7', 'F8'].includes(event.key)) {
                event.preventDefault();
                setOpen((state) => changeExternalOpen(state, event.key));
            }
            if (event.key === 'F5') {
                event.preventDefault();
                setAllowSwitch(true);
            }
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
                {beforePresent && <input data-testid="before" aria-label="Before menubar" className={s.outside} />}
                {rootPresent && (
                    <Menubar
                        modal={settings.removal?.modal ?? true}
                        aria-label="Application"
                        orientation={settings.orientation}
                        className={settings.orientation === 'vertical' ? 'flex flex-col gap-2' : 'flex gap-2'}
                        disabled={settings.disabled}
                    >
                        {menus.map((entry) => {
                            const menu = entry.id;
                            return (
                                <Menu.Root
                                    orientation={settings.popupOrientation}
                                    key={menu}
                                    disabled={entry.disabled}
                                    defaultOpen={settings.defaultOpen && menu === 'file'}
                                    open={settings.controlled ? open[menu] : undefined}
                                    onOpenChange={(open, details) => {
                                        if (settings.removal?.deferred && menu === 'file' && !open)
                                            details.preventUnmountOnClose();
                                        if (cancelChange(settings.name, menu, open, details.reason, allowSwitch))
                                            details.cancel();
                                        trace.change(
                                            menu,
                                            open,
                                            details.reason,
                                            details.isCanceled,
                                            details.event,
                                            details.trigger
                                        );
                                        if (settings.controlled && !details.isCanceled)
                                            setOpen((state) => ({ ...state, [menu]: open }));
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
                                        <Menu.Positioner
                                            className="z-50"
                                            side={settings.side}
                                            align="start"
                                            sideOffset={4}
                                        >
                                            <Menu.Popup
                                                id={`${menu}-popup`}
                                                className={s.popup + exit}
                                                finalFocus={
                                                    settings.removal?.finalFocus ? rootRemovalFinalFocus : undefined
                                                }
                                                data-testid={`${menu}-popup`}
                                                data-menu-popup={menu}
                                            >
                                                <MenuItems menu={menu} select={trace.select}>
                                                    {settings.nested && (
                                                        <Menu.SubmenuRoot
                                                            orientation={settings.childOrientation}
                                                            onOpenChange={(open, details) => {
                                                                if (
                                                                    cancelChange(
                                                                        settings.name,
                                                                        submenuId(menu),
                                                                        open,
                                                                        details.reason,
                                                                        allowSwitch
                                                                    )
                                                                )
                                                                    details.cancel();
                                                                trace.change(
                                                                    submenuId(menu),
                                                                    open,
                                                                    details.reason,
                                                                    details.isCanceled,
                                                                    details.event,
                                                                    details.trigger
                                                                );
                                                            }}
                                                            onOpenChangeComplete={(open) =>
                                                                trace.complete(submenuId(menu), open)
                                                            }
                                                        >
                                                            <Menu.SubmenuTrigger
                                                                render={<button />}
                                                                nativeButton
                                                                className={s.item}
                                                                data-testid={`${menu}-more`}
                                                                delay={settings.removal?.hoverPending ? 2000 : 100}
                                                            >
                                                                More
                                                            </Menu.SubmenuTrigger>
                                                            <Menu.Portal keepMounted={settings.keepMounted}>
                                                                <Menu.Positioner
                                                                    className="z-50"
                                                                    side={settings.dir === 'rtl' ? 'left' : 'right'}
                                                                    align="start"
                                                                    sideOffset={4}
                                                                >
                                                                    <Menu.Popup
                                                                        className={s.childPopup + exit}
                                                                        id={`${menu}-sub-popup`}
                                                                        data-testid={`${menu}-sub-popup`}
                                                                        data-menu-popup={`${menu}-sub`}
                                                                    >
                                                                        <Menu.Item
                                                                            render={<button />}
                                                                            nativeButton
                                                                            className={s.item}
                                                                            data-testid={`${menu}-sub-alpha`}
                                                                            onClick={() =>
                                                                                trace.select(`${menu}-sub-alpha`)
                                                                            }
                                                                        >
                                                                            Nested command
                                                                        </Menu.Item>
                                                                        {settings.orientationCase && (
                                                                            <>
                                                                                <Menu.Item
                                                                                    render={<button />}
                                                                                    nativeButton
                                                                                    disabled
                                                                                    className={s.item}
                                                                                    data-testid={`${menu}-sub-blocked`}
                                                                                >
                                                                                    Blocked nested command
                                                                                </Menu.Item>
                                                                                <Menu.Item
                                                                                    render={<button />}
                                                                                    nativeButton
                                                                                    className={s.item}
                                                                                    data-testid={`${menu}-sub-bravo`}
                                                                                    onClick={() =>
                                                                                        trace.select(
                                                                                            `${menu}-sub-bravo`
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Last nested command
                                                                                </Menu.Item>
                                                                            </>
                                                                        )}
                                                                    </Menu.Popup>
                                                                </Menu.Positioner>
                                                            </Menu.Portal>
                                                        </Menu.SubmenuRoot>
                                                    )}
                                                </MenuItems>
                                            </Menu.Popup>
                                        </Menu.Positioner>
                                    </Menu.Portal>
                                </Menu.Root>
                            );
                        })}
                    </Menubar>
                )}
                <button
                    type="button"
                    data-testid="outside"
                    className={s.outside + ' fixed start-24 top-[30rem]'}
                    onClick={() => trace.probe.activations++}
                >
                    Outside
                </button>
            </div>
            {settings.removal && <div className="min-h-[2000px]" />}
        </DirectionProvider>
    );
}
createRoot(document.getElementById('root')!).render(<ReactMenubar />);
