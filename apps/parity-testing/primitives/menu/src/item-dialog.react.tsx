import { Dialog } from '@base-ui/react/dialog';
import { Menu } from '@base-ui/react/menu';
import { useEffect, useRef, useState } from 'react';
import { heldExitClass } from '../../../shared/lifecycle';
import { config, installProbe, classes as s, type Layer } from './contract';
import { createDialogProbe, dialogClass } from './dialog';

function DialogSurface() {
    return (
        <Dialog.Portal>
            <Dialog.Popup className={dialogClass} data-testid="dialog-popup">
                <Dialog.Title>Confirm command</Dialog.Title>
                <Dialog.Description>Opened by a menu item.</Dialog.Description>
                <Dialog.Close data-testid="dialog-cancel">Cancel</Dialog.Close>
                <Dialog.Close data-testid="dialog-confirm">Confirm</Dialog.Close>
            </Dialog.Popup>
        </Dialog.Portal>
    );
}

export function ReactItemDialog() {
    const settings = config().itemDialog!;
    const [trace] = useState(() => installProbe('react'));
    const [dialog] = useState(createDialogProbe);
    trace.probe.dialog = dialog;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogHandle] = useState(() => Dialog.createHandle());
    const actions = useRef<Menu.Root.Actions | null>(null);
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
        setDialogOpen(true);
    }
    function change(layer: Layer, open: boolean, details: Menu.Root.ChangeEventDetails) {
        if (!open && settings.canceledClose) details.cancel();
        if (!open && settings.deferred) details.preventUnmountOnClose();
        trace.change(layer, open, details.reason, details.isCanceled, details.event, details.trigger);
    }
    function dialogChange(open: boolean, details: Dialog.Root.ChangeEventDetails) {
        if (open && settings.canceledOpen) details.cancel();
        dialog.changes.push({ open, reason: details.reason, canceled: details.isCanceled });
        dialog.nativeEvents.push({ type: details.event.type, trusted: details.event.isTrusted });
        if (!details.isCanceled) setDialogOpen(open);
    }
    return (
        <div className={s.layout}>
            <input data-testid="before" aria-label="Before menu" />
            <Menu.Root
                actionsRef={actions}
                onOpenChange={(open, details) => change('main', open, details)}
                onOpenChangeComplete={(open) => trace.complete('main', open)}
            >
                <Menu.Trigger className={s.trigger} data-testid="primary">
                    Actions
                </Menu.Trigger>
                <Menu.Portal keepMounted={settings.retained}>
                    <Menu.Positioner className="z-10" data-testid="positioner" align="start" sideOffset={4}>
                        <Menu.Popup className={s.popup + (settings.animated ? heldExitClass : '')} data-testid="popup">
                            {settings.stayOpen ? (
                                <Dialog.Root
                                    onOpenChange={dialogChange}
                                    onOpenChangeComplete={(open) => dialog.completions.push(open)}
                                >
                                    <Menu.Item
                                        className={s.item}
                                        data-testid="alpha"
                                        closeOnClick={false}
                                        render={<Dialog.Trigger />}
                                        nativeButton
                                        onClick={() => trace.select('alpha')}
                                    >
                                        Open dialog
                                    </Menu.Item>
                                    <DialogSurface />
                                </Dialog.Root>
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
                                                    Open dialog
                                                </Menu.Item>
                                            </Menu.Popup>
                                        </Menu.Positioner>
                                    </Menu.Portal>
                                </Menu.SubmenuRoot>
                            ) : settings.composed ? (
                                <Menu.Item
                                    className={s.item}
                                    data-testid="alpha"
                                    render={<Dialog.Trigger handle={dialogHandle} />}
                                    nativeButton
                                    onClick={() => trace.select('alpha')}
                                >
                                    Open dialog
                                </Menu.Item>
                            ) : (
                                <Menu.Item
                                    className={s.item}
                                    data-testid="alpha"
                                    onClick={() => activate('alpha')}
                                    render={<button />}
                                    nativeButton
                                >
                                    Open dialog
                                </Menu.Item>
                            )}
                            <Menu.Item className={s.item} data-testid="omega" render={<button />} nativeButton>
                                Other action
                            </Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            {!settings.stayOpen && (
                <Dialog.Root
                    open={dialogOpen}
                    handle={dialogHandle}
                    onOpenChange={dialogChange}
                    onOpenChangeComplete={(open) => dialog.completions.push(open)}
                >
                    <DialogSurface />
                </Dialog.Root>
            )}
            <input data-testid="after" aria-label="After menu" />
        </div>
    );
}
