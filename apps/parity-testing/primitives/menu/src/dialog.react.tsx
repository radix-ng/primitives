import { Dialog } from '@base-ui/react/dialog';
import { Menu } from '@base-ui/react/menu';
import { useEffect, useRef, useState } from 'react';
import { heldExitClass } from '../../../shared/lifecycle';
import { config, installProbe, classes as s, type Layer } from './contract';
import { createDialogProbe, dialogClass } from './dialog';

export function ReactDialogMenu() {
    const settings = config().dialog!;
    const [trace] = useState(() => installProbe('react'));
    const [dialog] = useState(createDialogProbe);
    trace.probe.dialog = dialog;
    const [mounted, setMounted] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const actions = useRef<Menu.Root.Actions | null>(null);
    useEffect(() => {
        function command(event: KeyboardEvent) {
            if (!['F3', 'F4', 'F5', 'F6'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F3') actions.current?.unmount();
            if (event.key === 'F4') setDialogOpen(false);
            if (event.key === 'F5') {
                setMounted(false);
                setDialogOpen(false);
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
            {mounted && (
                <Dialog.Root
                    open={dialogOpen}
                    onOpenChange={(open, details) => {
                        dialog.changes.push({ open, reason: details.reason, canceled: details.isCanceled });
                        dialog.nativeEvents.push({ type: details.event.type, trusted: details.event.isTrusted });
                        if (!details.isCanceled) setDialogOpen(open);
                    }}
                    onOpenChangeComplete={(open) => dialog.completions.push(open)}
                >
                    <Dialog.Trigger className="fixed start-2 top-2" data-testid="dialog-trigger">
                        Open dialog
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Popup className={dialogClass} data-testid="dialog-popup">
                            <Dialog.Title>Menu host</Dialog.Title>
                            <Dialog.Description>Commands inside a dialog.</Dialog.Description>
                            <button className="w-fit" data-testid="dialog-before">
                                Before menu
                            </button>
                            <Menu.Root
                                modal={settings.modal}
                                actionsRef={actions}
                                onOpenChange={(open, details) => change('main', open, details)}
                                onOpenChangeComplete={(open) => trace.complete('main', open)}
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
                                                    <Menu.Portal keepMounted={settings.retained}>
                                                        <Menu.Positioner
                                                            className="z-30"
                                                            side="right"
                                                            align="start"
                                                            sideOffset={4}
                                                        >
                                                            <Menu.Popup className={s.popup} data-testid="sub-popup">
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
                            <button className="w-fit" data-testid="dialog-after">
                                After menu
                            </button>
                            <Dialog.Close className="w-fit" data-testid="dialog-close">
                                Close dialog
                            </Dialog.Close>
                        </Dialog.Popup>
                    </Dialog.Portal>
                </Dialog.Root>
            )}
            <input className="fixed start-2 bottom-2" data-testid="after" aria-label="Background" />
        </>
    );
}
