import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Menu } from '@base-ui/react/menu';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { exitClass, heldExitClass } from '../../../shared/lifecycle';
import { changeCollection, menuEntries, submenuEntries } from '../../../shared/menu-collection';
import { rootRemovalFinalFocus } from '../../../shared/root-removal';
import { config, installProbe, classes as s, type Layer } from './contract';
import { ReactDialogMenu } from './dialog.react';
import { ReactFocusBoundary } from './focus-boundary.react';
import { ReactHandleOverlap } from './handle-overlap.react';
import { changeHighlightEntries, createHighlightRecorder } from './highlight';
import { ReactHosts } from './hosts.react';
import { ReactItemDialog } from './item-dialog.react';
import { ReactItemPopover } from './item-popover.react';
import { ReactPopoverMenu } from './popover.react';
import { ReactProjection } from './projection.react';
import { touchScrollEntries } from './touch';
import { ReactMultiTriggers } from './triggers.react';

const settings = config();
const trace = installProbe('react');
if (settings.highlight) trace.probe.highlights = createHighlightRecorder();
function ReactMenu() {
    const [rootPresent, setRootPresent] = useState(true);
    const [beforePresent, setBeforePresent] = useState(true);
    const exit =
        settings.removal?.animated || settings.lifecycle?.late || settings.name === 'lifecycle-submenu-css'
            ? heldExitClass
            : exitClass;
    const [items, setItems] = useState(
        settings.touch?.popupScroll ? touchScrollEntries : settings.empty && !settings.empty.nested ? [] : menuEntries
    );
    const [subItems, setSubItems] = useState(settings.empty?.nested ? [] : submenuEntries);
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
        if (
            (open && ['cancel-open', 'touch-cancel-open'].includes(settings.name)) ||
            (!open && ['cancel-close', 'touch-cancel-close'].includes(settings.name))
        )
            details.cancel();
        if (
            settings.name === 'hybrid-hover-touch-cancel' &&
            layer === 'main' &&
            open &&
            details.reason === 'trigger-press'
        )
            details.cancel();
        if (
            settings.name === 'hybrid-submenu-keyboard-touch-cancel' &&
            layer === 'sub' &&
            open &&
            details.reason === 'trigger-press'
        )
            details.cancel();
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
            if (settings.highlight?.mutation && event.key === 'F3') {
                event.preventDefault();
                setItems((items) => changeHighlightEntries(items, settings.name));
                return;
            }
            if (settings.empty && ['F3', 'F4'].includes(event.key)) {
                event.preventDefault();
                if (settings.empty.nested) setSubItems(event.key === 'F3' ? submenuEntries : []);
                else setItems(event.key === 'F3' ? menuEntries : []);
                return;
            }
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
                {settings.touch ? (
                    <button type="button" className={s.outside} data-testid="outside">
                        Background
                    </button>
                ) : (
                    <div className={s.outside} data-testid="outside">
                        Background
                    </div>
                )}
                {beforePresent && <input className={s.outside} aria-label="Before menu" data-testid="before" />}
                {rootPresent && (
                    <Menu.Root
                        actionsRef={actions}
                        modal={settings.modal}
                        loopFocus={settings.loop}
                        disabled={settings.disabled}
                        onOpenChange={(open, details) => change('main', open, details)}
                        onOpenChangeComplete={(open) => trace.complete('main', open)}
                        onItemHighlighted={(item, details) => trace.probe.highlights?.record('main', item, details)}
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
                                collisionPadding={settings.touch?.wide ? 0 : 5}
                                data-testid="positioner"
                            >
                                <Menu.Popup
                                    id={settings.ids ? popupId : undefined}
                                    className={
                                        s.popup +
                                        (settings.lifecycle?.animated ? exit : '') +
                                        (settings.touch?.popupScroll ? ' max-h-40 overflow-y-auto' : '') +
                                        (settings.touch?.wide ? ' w-screen!' : '')
                                    }
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
                                            label={
                                                settings.name === 'highlight-explicit-label-update'
                                                    ? item.label
                                                    : item.id === 'alpha'
                                                      ? settings.label
                                                      : undefined
                                            }
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
                                                    onItemHighlighted={(item, details) =>
                                                        trace.probe.highlights?.record('sub', item, details)
                                                    }
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
                                                    <Menu.Portal keepMounted={settings.empty?.retained ?? false}>
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
                                                    disabled={settings.name === 'touch-disabled-checkbox'}
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
                                                        disabled={settings.name === 'touch-disabled-radio'}
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
            {(settings.removal || settings.touch?.pageScroll) && <div className="min-h-[2000px]" />}
        </DirectionProvider>
    );
}
createRoot(document.getElementById('root')!).render(
    settings.itemPopover ? (
        <ReactItemPopover />
    ) : settings.popover ? (
        <ReactPopoverMenu />
    ) : settings.itemDialog ? (
        <ReactItemDialog />
    ) : settings.dialog ? (
        <ReactDialogMenu />
    ) : settings.name.startsWith('handle-overlap-') ? (
        <ReactHandleOverlap />
    ) : settings.multiTrigger ? (
        <ReactMultiTriggers />
    ) : settings.projection ? (
        <ReactProjection />
    ) : settings.focusBoundary ? (
        <ReactFocusBoundary />
    ) : settings.host ? (
        <ReactHosts />
    ) : (
        <ReactMenu />
    )
);
