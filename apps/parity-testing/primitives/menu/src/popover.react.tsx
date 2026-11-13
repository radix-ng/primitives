import { Menu } from '@base-ui/react/menu';
import { Popover } from '@base-ui/react/popover';
import { useEffect, useRef, useState } from 'react';
import { heldExitClass } from '../../../shared/lifecycle';
import { config, installProbe, classes as s, type Layer } from './contract';
import { createOverlayProbe } from './overlay-probe';
import { popoverHostClass } from './popover';

export function ReactPopoverMenu() {
    const settings = config().popover!;
    const [trace] = useState(() => installProbe('react'));
    const [parent] = useState(createOverlayProbe);
    trace.probe.popover = parent;
    const [mounted, setMounted] = useState(true);
    const [open, setOpen] = useState(false);
    const actions = useRef<Menu.Root.Actions | null>(null);
    useEffect(() => {
        function command(event: KeyboardEvent) {
            if (!['F3', 'F4', 'F5', 'F6'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F3') actions.current?.unmount();
            if (event.key === 'F4') setOpen(false);
            if (event.key === 'F5') {
                setMounted(false);
                setOpen(false);
            }
            if (event.key === 'F6') setMounted(true);
        }
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    function change(layer: Layer, open: boolean, details: Menu.Root.ChangeEventDetails) {
        if (!open && settings.canceled) details.cancel();
        if (!open && settings.deferred) details.preventUnmountOnClose();
        trace.change(layer, open, details.reason, details.isCanceled, details.event, details.trigger);
    }
    return (
        <>
            <div className="fixed start-24 top-8 grid gap-3">
                {mounted && (
                    <Popover.Root
                        open={open}
                        modal={settings.parentModal}
                        onOpenChange={(next, details) => {
                            parent.changes.push({ open: next, reason: details.reason, canceled: details.isCanceled });
                            parent.nativeEvents.push({ type: details.event.type, trusted: details.event.isTrusted });
                            if (!details.isCanceled) setOpen(next);
                        }}
                        onOpenChangeComplete={(next) => parent.completions.push(next)}
                    >
                        <Popover.Trigger className={s.trigger} data-testid="host-trigger">
                            Open popover
                        </Popover.Trigger>
                        <Popover.Portal>
                            <Popover.Positioner className="z-10" align="start" sideOffset={8}>
                                <Popover.Popup className={popoverHostClass} data-testid="host-popup">
                                    <Popover.Title>Menu host</Popover.Title>
                                    <Popover.Description>Commands inside a popover.</Popover.Description>
                                    <button className="w-fit" data-testid="host-before">
                                        Before menu
                                    </button>
                                    <Menu.Root
                                        modal={settings.menuModal}
                                        actionsRef={actions}
                                        onOpenChange={(next, details) => change('main', next, details)}
                                        onOpenChangeComplete={(next) => trace.complete('main', next)}
                                    >
                                        <Menu.Trigger className={s.trigger + ' w-28'} data-testid="primary">
                                            Actions
                                        </Menu.Trigger>
                                        <Menu.Portal keepMounted={settings.retained}>
                                            <Menu.Positioner
                                                className="z-20"
                                                data-testid="positioner"
                                                side="right"
                                                align="start"
                                                sideOffset={8}
                                            >
                                                <Menu.Popup
                                                    className={s.popup + (settings.animated ? heldExitClass : '')}
                                                    data-testid="popup"
                                                >
                                                    <Menu.Item
                                                        className={s.item}
                                                        data-testid="alpha"
                                                        onClick={() => trace.select('alpha')}
                                                        render={<button />}
                                                        nativeButton
                                                    >
                                                        First action
                                                    </Menu.Item>
                                                    {settings.nested && (
                                                        <Menu.SubmenuRoot
                                                            onOpenChange={(next, details) =>
                                                                change('sub', next, details)
                                                            }
                                                            onOpenChangeComplete={(next) => trace.complete('sub', next)}
                                                        >
                                                            <Menu.SubmenuTrigger
                                                                className={s.item}
                                                                data-testid="more"
                                                                render={<button />}
                                                                nativeButton
                                                            >
                                                                More
                                                            </Menu.SubmenuTrigger>
                                                            <Menu.Portal keepMounted={settings.retained}>
                                                                <Menu.Positioner
                                                                    className="z-30"
                                                                    side="right"
                                                                    align="start"
                                                                    sideOffset={4}
                                                                >
                                                                    <Menu.Popup
                                                                        className={s.popup}
                                                                        data-testid="sub-popup"
                                                                    >
                                                                        <Menu.Item
                                                                            className={s.item}
                                                                            data-testid="sub-alpha"
                                                                            onClick={() => trace.select('sub-alpha')}
                                                                            render={<button />}
                                                                            nativeButton
                                                                        >
                                                                            Child action
                                                                        </Menu.Item>
                                                                    </Menu.Popup>
                                                                </Menu.Positioner>
                                                            </Menu.Portal>
                                                        </Menu.SubmenuRoot>
                                                    )}
                                                    <Menu.Item
                                                        className={s.item}
                                                        data-testid="omega"
                                                        render={<button />}
                                                        nativeButton
                                                    >
                                                        Last action
                                                    </Menu.Item>
                                                </Menu.Popup>
                                            </Menu.Positioner>
                                        </Menu.Portal>
                                    </Menu.Root>
                                    <button className="w-fit" data-testid="host-after">
                                        After menu
                                    </button>
                                    <Popover.Close className="w-fit" data-testid="host-close">
                                        Close popover
                                    </Popover.Close>
                                </Popover.Popup>
                            </Popover.Positioner>
                        </Popover.Portal>
                    </Popover.Root>
                )}
            </div>
            <input className="fixed start-2 bottom-2" data-testid="after" aria-label="Background" />
        </>
    );
}
