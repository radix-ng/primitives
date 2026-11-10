import { Popover } from '@base-ui/react/popover';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { config, installProbe, classes as s } from './contract';

const settings = config();
const trace = installProbe('react');
function ReactPopover() {
    const [wide, setWide] = useState(false),
        [moved, setMoved] = useState(false);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (event.key === 'F2') {
                event.preventDefault();
                setWide((v) => !v);
            }
            if (event.key === 'F6') {
                event.preventDefault();
                setMoved((v) => !v);
            }
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    return (
        <div className={settings.scrolling ? s.shell : 'contents'} data-testid="scroller">
            <div
                className={
                    (settings.scrolling ? 'm-16 ' : 'fixed start-24 top-24 ') +
                    s.form +
                    (wide ? ' w-80!' : '') +
                    (moved ? ' translate-x-8 translate-y-4' : '')
                }
                data-testid="layout"
            >
                <button
                    className={s.trigger}
                    onClick={() => trace.probe.activations++}
                    data-testid="outside"
                    type="button"
                >
                    Outside
                </button>
                <Popover.Root
                    modal={settings.modal}
                    onOpenChange={(open, details) => {
                        if ((open && settings.name === 'cancel-open') || (!open && settings.name === 'cancel-close'))
                            details.cancel();
                        trace.change(open, details.reason, details.isCanceled, details.event, details.trigger);
                    }}
                    onOpenChangeComplete={trace.complete}
                >
                    <Popover.Trigger
                        className={s.trigger}
                        disabled={settings.disabled}
                        id="primary-trigger"
                        data-testid="primary"
                    >
                        Open details
                    </Popover.Trigger>
                    {settings.name === 'switch-trigger' && (
                        <Popover.Trigger className={s.trigger} id="secondary-trigger" data-testid="secondary">
                            Other details
                        </Popover.Trigger>
                    )}
                    <Popover.Portal>
                        {settings.modal === true && <Popover.Backdrop className="fixed inset-0 z-40" />}
                        <Popover.Positioner
                            className="z-50"
                            disableAnchorTracking={settings.frozen}
                            sideOffset={5}
                            align="start"
                            collisionPadding={5}
                            data-testid="positioner"
                        >
                            <Popover.Popup className={s.popup} initialFocus={settings.initialFocus} data-testid="popup">
                                <Popover.Title>Details</Popover.Title>
                                <Popover.Description>Edit the note, then close.</Popover.Description>
                                <label htmlFor="note">Note</label>
                                <input className={s.input} id="note" data-testid="field" defaultValue="draft" />
                                <Popover.Close className={s.trigger} data-testid="close">
                                    Close
                                </Popover.Close>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <button className={s.trigger} data-testid="after" type="button">
                    After
                </button>
            </div>
            {settings.scrolling && <div className="h-[700px]" aria-hidden="true" />}
        </div>
    );
}
createRoot(document.getElementById('root')!).render(<ReactPopover />);
