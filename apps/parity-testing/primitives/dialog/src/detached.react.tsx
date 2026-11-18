import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useState } from 'react';
import { classes, installProbe, type DetachedSettings } from './contract';

export function ReactDetachedDialog({ settings }: { settings: DetachedSettings }) {
    const [trace] = useState(installProbe);
    const [firstHandle] = useState(() => Dialog.createHandle<string>());
    const [secondHandle] = useState(() => Dialog.createHandle<string>());
    const [open, setOpen] = useState<boolean | undefined>(settings.controlled ? false : undefined);
    const [rootMounted, setRootMounted] = useState(!settings.initiallyDetached);
    const [secondary, setSecondary] = useState(!!settings.secondary);
    const [revision, setRevision] = useState('');
    const [swapped, setSwapped] = useState(false);
    const handle = swapped ? secondHandle : firstHandle;

    useEffect(() => {
        trace.probe.readHandles = () => [firstHandle.isOpen, secondHandle.isOpen];
        const command = (event: KeyboardEvent) => {
            if (!['F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F2') handle.open(null);
            if (event.key === 'F3') setRevision(' updated');
            if (event.key === 'F4') firstHandle.close();
            if (event.key === 'F5') setSecondary((visible) => !visible);
            if (event.key === 'F6') setRootMounted((mounted) => !mounted);
            if (event.key === 'F7') setSwapped((swapped) => !swapped);
            if (event.key === 'F8') handle.open(settings.openId ?? 'primary');
            if (event.key === 'F9') handle.close();
            if (event.key === 'F10') handle.openWithPayload('programmatic data');
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, [firstHandle, handle, secondHandle, settings.openId, trace]);

    return (
        <main className="flex gap-2">
            <button className={classes.trigger} data-testid="outside" type="button">
                Outside
            </button>
            <Dialog.Trigger
                id="primary"
                className={classes.trigger}
                handle={firstHandle}
                payload={`account${revision}`}
                data-testid="primary"
            >
                Account
            </Dialog.Trigger>
            {secondary && (
                <Dialog.Trigger
                    id="secondary"
                    className={classes.trigger}
                    handle={settings.swap ? secondHandle : firstHandle}
                    payload={`billing${revision}`}
                    data-testid="secondary"
                >
                    Billing
                </Dialog.Trigger>
            )}
            {rootMounted && (
                <Dialog.Root
                    handle={handle}
                    open={open}
                    onOpenChange={(open, { reason, event, trigger, isCanceled }) => {
                        trace.change(open, reason, event, trigger, isCanceled);
                        if (open && settings.controlled) setOpen(true);
                    }}
                    onOpenChangeComplete={(open) => trace.probe.completions.push(open)}
                >
                    {({ payload }) => (
                        <Dialog.Portal>
                            <Dialog.Backdrop className={classes.backdrop} data-testid="backdrop" />
                            <Dialog.Popup className={classes.popup} data-testid="popup">
                                <Dialog.Title>Example dialog</Dialog.Title>
                                <Dialog.Description>Test a draft edit.</Dialog.Description>
                                <p data-testid="payload">{payload}</p>
                                <input
                                    className={classes.input}
                                    defaultValue="draft"
                                    aria-label="Draft"
                                    data-testid="field"
                                />
                                <Dialog.Close className={classes.trigger} data-testid="close">
                                    Close
                                </Dialog.Close>
                            </Dialog.Popup>
                        </Dialog.Portal>
                    )}
                </Dialog.Root>
            )}
        </main>
    );
}
