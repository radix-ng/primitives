import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Menu } from '@base-ui/react/menu';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { exitClass } from '../../../shared/lifecycle';
import { changeCollection, menuEntries, submenuEntries } from '../../../shared/menu-collection';
import { rootRemovalExitClass, rootRemovalFinalFocus } from '../../../shared/root-removal';
import { config, installProbe, classes as s, type Layer } from './contract';

const settings = config();
const trace = installProbe('react');
function ReactMenu() {
    const [rootPresent, setRootPresent] = useState(true);
    const [beforePresent, setBeforePresent] = useState(true);
    const exit = settings.removal?.animated || settings.lifecycle?.late ? rootRemovalExitClass : exitClass;
    const [items, setItems] = useState(menuEntries);
    const [subItems, setSubItems] = useState(submenuEntries);
    const [submenuPresent, setSubmenuPresent] = useState(true);
    const actions = useRef<Menu.Root.Actions | null>(null);
    const closes = useRef(0);
    const lateHold = useRef<(() => void) | undefined>(undefined);
    function change(layer: Layer, open: boolean, details: Menu.Root.ChangeEventDetails) {
        if (layer === 'main' && !open && ++closes.current === 1) {
            lateHold.current = details.preventUnmountOnClose;
            if (settings.lifecycle?.deferred || settings.lifecycle?.canceled) details.preventUnmountOnClose();
            if (settings.lifecycle?.canceled) details.cancel();
        }
        if ((open && settings.name === 'cancel-open') || (!open && settings.name === 'cancel-close')) details.cancel();
        trace.change(layer, open, details.reason, details.isCanceled, details.event, details.trigger);
    }
    const [triggerId, setTriggerId] = useState('custom-trigger');
    const [popupId, setPopupId] = useState('custom-popup');
    useEffect(() => {
        const outside = (event: MouseEvent) => {
            if ((event.target as Element)?.closest('[data-testid="outside"]')) trace.probe.activations++;
        };
        document.addEventListener('click', outside);
        const command = (event: KeyboardEvent) => {
            if (settings.removal && ['F3', 'F4'].includes(event.key)) {
                event.preventDefault();
                setRootPresent(event.key === 'F4');
                if (event.key === 'F3' && settings.removal.missingFocus) setBeforePresent(false);
                return;
            }
            if (['F3', 'F4'].includes(event.key) && settings.name.startsWith('collection-')) {
                event.preventDefault();
                if (settings.name === 'collection-submenu-unmount') setSubmenuPresent(event.key === 'F4');
                else {
                    const nested = settings.name.startsWith('collection-submenu');
                    (nested ? setSubItems : setItems)((items) =>
                        changeCollection(items, settings.name, {
                            id: nested ? 'sub-new' : 'new',
                            label: 'New',
                            disabled: false
                        })
                    );
                }
            }
            if (['F8', 'F9', 'F10'].includes(event.key)) {
                event.preventDefault();
                if (event.key === 'F8') actions.current?.close();
                if (event.key === 'F9') actions.current?.unmount();
                if (event.key === 'F10') lateHold.current?.();
            }
            if (event.key !== 'F2') return;
            event.preventDefault();
            setTriggerId('renamed-trigger');
            setPopupId('renamed-popup');
        };
        document.addEventListener('keydown', command);
        return () => {
            document.removeEventListener('click', outside);
            document.removeEventListener('keydown', command);
        };
    }, []);
    return (
        <DirectionProvider direction={settings.dir}>
            <div className={s.layout}>
                <div className={s.outside} data-testid="outside">
                    Background
                </div>
                {beforePresent && <input className={s.outside} aria-label="Before menu" data-testid="before" />}
                {rootPresent && (
                    <Menu.Root
                        actionsRef={actions}
                        modal={settings.modal}
                        loopFocus={settings.loop}
                        disabled={settings.disabled}
                        onOpenChange={(open, details) => change('main', open, details)}
                        onOpenChangeComplete={(open) => trace.complete('main', open)}
                    >
                        <Menu.Trigger
                            id={settings.ids ? triggerId : undefined}
                            className={s.trigger}
                            data-testid="primary"
                            openOnHover={settings.pointer.rootHover}
                            delay={settings.pointer.delay}
                            closeDelay={settings.pointer.closeDelay}
                        >
                            Actions
                        </Menu.Trigger>
                        <Menu.Portal keepMounted={settings.lifecycle?.keepMounted ?? false}>
                            <Menu.Positioner
                                className="z-50"
                                align="start"
                                sideOffset={4}
                                collisionPadding={5}
                                data-testid="positioner"
                            >
                                <Menu.Popup
                                    id={settings.ids ? popupId : undefined}
                                    className={s.popup + (settings.lifecycle?.animated ? exit : '')}
                                    finalFocus={settings.removal?.finalFocus ? rootRemovalFinalFocus : undefined}
                                    data-testid="popup"
                                >
                                    {items.map((item) => (
                                        <Menu.Item
                                            key={item.id}
                                            render={<button />}
                                            nativeButton
                                            className={s.item}
                                            disabled={item.disabled}
                                            label={item.id === 'alpha' ? settings.label : undefined}
                                            data-testid={item.id}
                                            onClick={() => trace.select(item.id)}
                                        >
                                            {item.label}
                                        </Menu.Item>
                                    ))}
                                    {!settings.collectionOnly && (
                                        <>
                                            {settings.submenu && submenuPresent && (
                                                <Menu.SubmenuRoot
                                                    onOpenChange={(open, details) => change('sub', open, details)}
                                                    onOpenChangeComplete={(open) => trace.complete('sub', open)}
                                                >
                                                    <Menu.SubmenuTrigger
                                                        render={<button />}
                                                        nativeButton
                                                        className={s.item}
                                                        data-testid="more"
                                                        disabled={settings.pointer.disabledSubmenu}
                                                        delay={
                                                            settings.removal?.hoverPending
                                                                ? 2000
                                                                : settings.pointer.delay
                                                        }
                                                        closeDelay={settings.pointer.closeDelay}
                                                    >
                                                        More
                                                    </Menu.SubmenuTrigger>
                                                    <Menu.Portal>
                                                        <Menu.Positioner
                                                            className="z-50"
                                                            side={settings.dir === 'rtl' ? 'left' : 'right'}
                                                            align="start"
                                                            sideOffset={4}
                                                            collisionPadding={5}
                                                        >
                                                            <Menu.Popup
                                                                className={
                                                                    s.popup + (settings.lifecycle?.animated ? exit : '')
                                                                }
                                                                data-testid="sub-popup"
                                                            >
                                                                {subItems.map((item) => (
                                                                    <Menu.Item
                                                                        key={item.id}
                                                                        render={<button />}
                                                                        nativeButton
                                                                        className={s.item}
                                                                        disabled={item.disabled}
                                                                        data-testid={item.id}
                                                                        onClick={() => trace.select(item.id)}
                                                                    >
                                                                        {item.label}
                                                                    </Menu.Item>
                                                                ))}
                                                            </Menu.Popup>
                                                        </Menu.Positioner>
                                                    </Menu.Portal>
                                                </Menu.SubmenuRoot>
                                            )}
                                            <Menu.Item
                                                render={<button />}
                                                nativeButton
                                                className={s.item}
                                                closeOnClick={false}
                                                data-testid="stay"
                                                onClick={() => trace.select('stay')}
                                            >
                                                Stay open
                                            </Menu.Item>
                                            {settings.checkbox && (
                                                <Menu.CheckboxItem
                                                    render={<button />}
                                                    nativeButton
                                                    className={s.item}
                                                    data-testid="check"
                                                    onCheckedChange={(value, details) => {
                                                        if (settings.name === 'checkbox-cancel') details.cancel();
                                                        trace.value(value, details.reason, details.isCanceled);
                                                    }}
                                                >
                                                    Notifications
                                                </Menu.CheckboxItem>
                                            )}
                                            {settings.radio && (
                                                <Menu.RadioGroup
                                                    defaultValue="one"
                                                    onValueChange={(value, details) => {
                                                        if (settings.name === 'radio-cancel') details.cancel();
                                                        trace.value(value, details.reason, details.isCanceled);
                                                    }}
                                                >
                                                    <Menu.RadioItem
                                                        render={<button />}
                                                        nativeButton
                                                        className={s.item}
                                                        value="one"
                                                        data-testid="radio-one"
                                                    >
                                                        Small
                                                    </Menu.RadioItem>
                                                    <Menu.RadioItem
                                                        render={<button />}
                                                        nativeButton
                                                        className={s.item}
                                                        value="two"
                                                        data-testid="radio-two"
                                                    >
                                                        Large
                                                    </Menu.RadioItem>
                                                </Menu.RadioGroup>
                                            )}
                                            <Menu.Item
                                                render={<button />}
                                                nativeButton
                                                className={s.item}
                                                data-testid="omega"
                                                onClick={() => trace.select('omega')}
                                            >
                                                Omega
                                            </Menu.Item>
                                        </>
                                    )}
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.Root>
                )}
                <input className={s.outside} aria-label="After menu" data-testid="after" />
            </div>
            {settings.removal && <div className="min-h-[2000px]" />}
        </DirectionProvider>
    );
}
createRoot(document.getElementById('root')!).render(<ReactMenu />);
