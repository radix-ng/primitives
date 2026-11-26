import { Tooltip } from '@base-ui/react/tooltip';
import { useRef, useState } from 'react';
import { copyId, identityInitialState, type IdentityRequest, pasteId } from './identity';

const initial = identityInitialState();

export function TooltipIdentityFixture() {
    const [handle] = useState(Tooltip.createHandle<string>);
    const [triggerId, setTriggerId] = useState(initial.triggerId);
    const [defaultTriggerId, setDefaultTriggerId] = useState(initial.defaultTriggerId);
    const [showPaste, setShowPaste] = useState(initial.showPaste);
    const [pastePayload, setPastePayload] = useState('Paste payload');
    const [pasteVersion, setPasteVersion] = useState(0);
    const [requests, setRequests] = useState<IdentityRequest[]>([]);
    const [completions, setCompletions] = useState<boolean[]>([]);
    const [keepMounted, setKeepMounted] = useState(initial.lifecycle);
    const [cursorAxis, setCursorAxis] = useState<Tooltip.Root.Props['trackCursorAxis']>('none');
    const [disableHover, setDisableHover] = useState(false);
    const cancelClose = useRef(false);
    const holdClose = useRef(false);
    const actions = useRef<Tooltip.Root.Actions>(null);

    function request(open: boolean, details: Tooltip.Root.ChangeEventDetails): void {
        if (!open && cancelClose.current) {
            cancelClose.current = false;
            details.cancel();
        }
        if (!open && !details.isCanceled && holdClose.current) {
            holdClose.current = false;
            details.preventUnmountOnClose();
        }

        const entry = {
            open,
            reason: details.reason,
            canceled: details.isCanceled,
            trigger: details.trigger?.id ?? null
        };
        setRequests((previous) => [...previous, entry]);
    }

    return (
        <>
            <div style={{ display: 'flex', gap: 160, margin: 48 }} data-identity-triggers>
                <Tooltip.Trigger
                    id={copyId}
                    handle={handle}
                    payload="Copy payload"
                    delay={initial.pointer ? 0 : undefined}
                    closeDelay={initial.pointer ? 240 : undefined}
                    type="button"
                >
                    Copy
                </Tooltip.Trigger>
                {showPaste && (
                    <Tooltip.Trigger
                        key={pasteVersion}
                        id={pasteId}
                        handle={handle}
                        payload={pastePayload}
                        type="button"
                    >
                        Paste
                    </Tooltip.Trigger>
                )}
            </div>
            <Tooltip.Root
                open={initial.open}
                defaultOpen={initial.defaultOpen}
                triggerId={triggerId}
                defaultTriggerId={defaultTriggerId}
                handle={handle}
                trackCursorAxis={cursorAxis}
                disableHoverablePopup={disableHover}
                actionsRef={actions}
                onOpenChange={request}
                onOpenChangeComplete={(open) => setCompletions((previous) => [...previous, open])}
            >
                {({ payload }) => (
                    <Tooltip.Portal keepMounted={keepMounted}>
                        <Tooltip.Positioner
                            side={initial.side}
                            sideOffset={initial.pointer ? 24 : 0}
                            data-identity-positioner
                        >
                            <Tooltip.Popup data-identity-popup>
                                {initial.viewport ? (
                                    <Tooltip.Viewport data-identity-viewport>{payload}</Tooltip.Viewport>
                                ) : (
                                    payload
                                )}
                                {initial.arrow && <Tooltip.Arrow data-identity-arrow />}
                            </Tooltip.Popup>
                        </Tooltip.Positioner>
                    </Tooltip.Portal>
                )}
            </Tooltip.Root>

            <button onClick={() => setTriggerId(copyId)} type="button">
                Use Copy trigger
            </button>
            <button onClick={() => setTriggerId(pasteId)} type="button">
                Use Paste trigger
            </button>
            <button onClick={() => setTriggerId(null)} type="button">
                Release trigger
            </button>
            <button onClick={() => setDefaultTriggerId(copyId)} type="button">
                Set default to Copy
            </button>
            <button onClick={() => setPastePayload('Updated Paste payload')} type="button">
                Update Paste payload
            </button>
            <button onClick={() => setPasteVersion((version) => version + 1)} type="button">
                Replace Paste
            </button>
            <button onClick={() => setShowPaste(false)} type="button">
                Hide Paste
            </button>
            <button onClick={() => setShowPaste(true)} type="button">
                Show Paste
            </button>
            <button
                onClick={() => {
                    cancelClose.current = true;
                }}
                type="button"
            >
                Cancel next close
            </button>
            <button onClick={() => handle.open(copyId)} type="button">
                Open Copy via handle
            </button>
            <button onClick={() => handle.open(pasteId)} type="button">
                Open Paste via handle
            </button>
            <button onClick={() => handle.close()} type="button">
                Close via handle
            </button>
            {initial.lifecycle && (
                <>
                    <button
                        onClick={() => {
                            holdClose.current = true;
                        }}
                        type="button"
                    >
                        Hold next close
                    </button>
                    <button onClick={() => actions.current?.unmount()} type="button">
                        Finish close
                    </button>
                    <button onClick={() => setKeepMounted(false)} type="button">
                        Remove retention
                    </button>
                    <output data-identity-completions>{JSON.stringify(completions)}</output>
                </>
            )}
            {initial.pointer && (
                <>
                    <button onClick={() => setCursorAxis('x')} type="button">
                        Track X
                    </button>
                    <button onClick={() => setCursorAxis('y')} type="button">
                        Track Y
                    </button>
                    <button onClick={() => setCursorAxis('both')} type="button">
                        Track both
                    </button>
                    <button onClick={() => setCursorAxis('none')} type="button">
                        Stop tracking
                    </button>
                    <button onClick={() => setDisableHover(true)} type="button">
                        Disable popup hover
                    </button>
                </>
            )}
            <output data-identity-requests>{JSON.stringify(requests)}</output>
        </>
    );
}
