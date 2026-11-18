import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { classes, config, installProbe } from './contract';
import './fixture.css';

const settings = config();
const trace = installProbe();

function ReactDialog() {
    const [open, setOpen] = useState(settings.open);
    const [defaultOpen, setDefaultOpen] = useState(settings.defaultOpen ?? false);
    const [triggerId, setTriggerId] = useState(settings.triggerId);
    const [secondary, setSecondary] = useState(!!settings.multiple);
    const actions = useRef<Dialog.Root.Actions>(null);
    const requested = useRef<boolean | undefined>(undefined);
    const cancelNextOpen = useRef(!!settings.cancelOpen);
    const holdNextClose = useRef(!!settings.hold);

    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (!['F2', 'F3', 'F4', 'F5', 'F9', 'F10'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F2' && requested.current !== undefined) setOpen(requested.current);
            if (event.key === 'F3') setDefaultOpen((open) => !open);
            if (event.key === 'F4') setTriggerId(null);
            if (event.key === 'F5') setSecondary((present) => !present);
            if (event.key === 'F10') actions.current?.close();
            if (event.key === 'F9' || event.key === 'F10') actions.current?.unmount();
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);

    return (
        <main className="flex gap-2">
            <button className={classes.trigger} data-testid="outside" onClick={() => trace.probe.activations++}>
                Outside
            </button>
            <Dialog.Root
                actionsRef={actions}
                open={open}
                defaultOpen={defaultOpen}
                triggerId={triggerId}
                defaultTriggerId={settings.defaultTriggerId}
                modal={settings.modal}
                disablePointerDismissal={settings.disablePointerDismissal}
                onOpenChange={(next, details) => {
                    if (next && cancelNextOpen.current) {
                        cancelNextOpen.current = false;
                        details.cancel();
                    }
                    if (!next && holdNextClose.current) {
                        holdNextClose.current = false;
                        details.preventUnmountOnClose();
                    }
                    trace.change(next, details.reason, details.event, details.trigger, details.isCanceled);
                    if (details.isCanceled) return;
                    requested.current = next;
                    if (open !== undefined && !settings.defer) setOpen(next);
                }}
                onOpenChangeComplete={(open) => trace.probe.completions.push(open)}
            >
                <Dialog.Trigger className={classes.trigger} id="primary" data-testid="primary">
                    Primary
                </Dialog.Trigger>
                {secondary && (
                    <Dialog.Trigger className={classes.trigger} id="secondary" data-testid="secondary">
                        Secondary
                    </Dialog.Trigger>
                )}
                <Dialog.Portal keepMounted={settings.keepMounted}>
                    {(settings.backdrop ?? settings.modal === undefined) && (
                        <Dialog.Backdrop className={classes.backdrop} data-testid="backdrop" />
                    )}
                    <Dialog.Popup
                        className={classes.popup}
                        data-motion={settings.animate ? '' : undefined}
                        data-testid="popup"
                    >
                        <Dialog.Title>Example dialog</Dialog.Title>
                        <Dialog.Description>Test a draft edit.</Dialog.Description>
                        <input className={classes.input} defaultValue="draft" data-testid="field" aria-label="Draft" />
                        <Dialog.Close className={classes.trigger} data-testid="close">
                            Close
                        </Dialog.Close>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            {settings.modal !== undefined && (
                <>
                    <input className={classes.input} data-testid="outside-field" aria-label="Outside field" />
                    <div className="size-16" data-testid="outside-surface" />
                </>
            )}
        </main>
    );
}

createRoot(document.getElementById('root')!).render(<ReactDialog />);
