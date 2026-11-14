import { Menu } from '@base-ui/react/menu';
import { Popover } from '@base-ui/react/popover';
import { useEffect, useRef, useState } from 'react';
import { heldExitClass } from '../../../shared/lifecycle';
import { config, installProbe, classes as s, type Layer } from './contract';
import { itemPopoverClass } from './item-popover';
import { createOverlayProbe } from './overlay-probe';

function PopoverSurface({ anchor }: { anchor: () => HTMLElement | null }) {
    return (
        <Popover.Portal>
            <Popover.Positioner className="z-30" anchor={anchor} side="right" align="start" sideOffset={8}>
                <Popover.Popup className={itemPopoverClass} data-testid="item-popup">
                    <Popover.Title>Command details</Popover.Title>
                    <Popover.Description>Opened by a menu item.</Popover.Description>
                    <Popover.Close data-testid="popover-cancel">Cancel</Popover.Close>
                    <Popover.Close data-testid="popover-confirm">Confirm</Popover.Close>
                </Popover.Popup>
            </Popover.Positioner>
        </Popover.Portal>
    );
}

export function ReactItemPopover() {
    const settings = config().itemPopover!;
    const [trace] = useState(() => installProbe('react'));
    const [popover] = useState(createOverlayProbe);
    trace.probe.popover = popover;
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [popoverHandle] = useState(() => Popover.createHandle());
    const actions = useRef<Menu.Root.Actions | null>(null);
    const menuAnchor = useRef<HTMLButtonElement | null>(null);
    const itemAnchor = useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
        function command(event: KeyboardEvent) {
            if (event.key !== 'F3') return;
            event.preventDefault();
            actions.current?.unmount();
        }
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    function activate(id: string) {
        trace.select(id);
        setPopoverOpen(true);
    }
    function change(layer: Layer, open: boolean, details: Menu.Root.ChangeEventDetails) {
        if (!open && settings.canceledClose) details.cancel();
        if (!open && settings.deferred) details.preventUnmountOnClose();
        trace.change(layer, open, details.reason, details.isCanceled, details.event, details.trigger);
    }
    function popoverChange(open: boolean, details: Popover.Root.ChangeEventDetails) {
        if (open && settings.canceledOpen) details.cancel();
        popover.changes.push({ open, reason: details.reason, canceled: details.isCanceled });
        popover.nativeEvents.push({ type: details.event.type, trusted: details.event.isTrusted });
        if (!details.isCanceled) setPopoverOpen(open);
    }
    return (
        <div className={s.layout}>
            <input data-testid="before" aria-label="Before menu" />
            <Menu.Root
                actionsRef={actions}
                onOpenChange={(open, details) => change('main', open, details)}
                onOpenChangeComplete={(open) => trace.complete('main', open)}
            >
                <Menu.Trigger ref={menuAnchor} className={s.trigger} data-testid="primary">
                    Actions
                </Menu.Trigger>
                <Menu.Portal keepMounted={settings.retained}>
                    <Menu.Positioner className="z-10" data-testid="positioner" align="start" sideOffset={4}>
                        <Menu.Popup className={s.popup + (settings.animated ? heldExitClass : '')} data-testid="popup">
                            {settings.stayOpen && !settings.composed ? (
                                <Popover.Root
                                    modal={settings.modal}
                                    onOpenChange={popoverChange}
                                    onOpenChangeComplete={(open) => popover.completions.push(open)}
                                >
                                    <Menu.Item
                                        className={s.item}
                                        data-testid="alpha"
                                        ref={itemAnchor}
                                        closeOnClick={false}
                                        render={<Popover.Trigger />}
                                        nativeButton
                                        onClick={() => trace.select('alpha')}
                                    >
                                        Open popover
                                    </Menu.Item>
                                    <PopoverSurface anchor={() => itemAnchor.current} />
                                </Popover.Root>
                            ) : settings.nested ? (
                                <Menu.SubmenuRoot
                                    onOpenChange={(open, details) => change('sub', open, details)}
                                    onOpenChangeComplete={(open) => trace.complete('sub', open)}
                                >
                                    <Menu.SubmenuTrigger
                                        className={s.item}
                                        data-testid="more"
                                        render={<button />}
                                        nativeButton
                                    >
                                        More
                                    </Menu.SubmenuTrigger>
                                    <Menu.Portal>
                                        <Menu.Positioner className="z-20" side="right" align="start" sideOffset={4}>
                                            <Menu.Popup className={s.popup} data-testid="sub-popup">
                                                <Menu.Item
                                                    className={s.item}
                                                    data-testid="sub-alpha"
                                                    onClick={() => activate('sub-alpha')}
                                                    render={<button />}
                                                    nativeButton
                                                >
                                                    Open popover
                                                </Menu.Item>
                                            </Menu.Popup>
                                        </Menu.Positioner>
                                    </Menu.Portal>
                                </Menu.SubmenuRoot>
                            ) : settings.composed ? (
                                <Menu.Item
                                    className={s.item}
                                    closeOnClick={false}
                                    data-testid="alpha"
                                    render={<Popover.Trigger handle={popoverHandle} />}
                                    nativeButton
                                    onClick={() => trace.select('alpha')}
                                >
                                    Open popover
                                </Menu.Item>
                            ) : (
                                <Menu.Item
                                    className={s.item}
                                    data-testid="alpha"
                                    onClick={() => activate('alpha')}
                                    render={<button />}
                                    nativeButton
                                >
                                    Open popover
                                </Menu.Item>
                            )}
                            <Menu.Item className={s.item} data-testid="omega" render={<button />} nativeButton>
                                Other action
                            </Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            {(!settings.stayOpen || settings.composed) && (
                <Popover.Root
                    open={popoverOpen}
                    handle={popoverHandle}
                    onOpenChange={popoverChange}
                    onOpenChangeComplete={(open) => popover.completions.push(open)}
                >
                    <PopoverSurface anchor={() => menuAnchor.current} />
                </Popover.Root>
            )}
            <input data-testid="after" aria-label="After menu" />
        </div>
    );
}
