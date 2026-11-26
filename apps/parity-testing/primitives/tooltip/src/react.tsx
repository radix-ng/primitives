import { Tooltip } from '@base-ui/react/tooltip';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    groupTimeout,
    hoverCloseDelay,
    hoverDelay,
    installFixture,
    type OpenRequest,
    triggerHoverCloseDelay,
    triggerHoverDelay,
    updatedHoverCloseDelay,
    updatedHoverDelay
} from './contract';
import { TooltipIdentityFixture } from './react-identity';

const initial = installFixture();

function TooltipFixture() {
    const [open, setOpen] = useState(initial.open);
    const [defaultOpen, setDefaultOpen] = useState(initial.defaultOpen);
    const [disabled, setDisabled] = useState(false);
    const [providerDelay, setProviderDelay] = useState(hoverDelay);
    const [providerCloseDelay, setProviderCloseDelay] = useState(initial.interactions ? hoverCloseDelay : 0);
    const [primaryCloseDelay, setPrimaryCloseDelay] = useState<number>();
    const [timeout, setInstantTimeout] = useState(groupTimeout);
    const [requests, setRequests] = useState<OpenRequest[]>([]);
    const [siblingRequests, setSiblingRequests] = useState<OpenRequest[]>([]);
    const cancelNext = useRef(false);

    function request(nextOpen: boolean, details: Tooltip.Root.ChangeEventDetails, sibling = false): void {
        if (!sibling && cancelNext.current) {
            cancelNext.current = false;
            details.cancel();
        }
        const { reason, isCanceled } = details;
        const setLog = sibling ? setSiblingRequests : setRequests;
        setLog((previous) => [...previous, { open: nextOpen, reason, canceled: isCanceled }]);
    }

    return (
        <>
            <div>
                <Tooltip.Provider delay={providerDelay} closeDelay={providerCloseDelay} timeout={timeout}>
                    <Tooltip.Root
                        open={open}
                        defaultOpen={defaultOpen}
                        disabled={disabled}
                        disableHoverablePopup={initial.interactions}
                        onOpenChange={request}
                    >
                        <Tooltip.Trigger
                            delay={initial.interactions ? undefined : hoverDelay}
                            closeDelay={primaryCloseDelay}
                            type="button"
                        >
                            Copy
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Positioner>
                                <Tooltip.Popup data-popup="Copy">Copy to clipboard</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    {initial.interactions && (
                        <Tooltip.Root
                            disableHoverablePopup
                            onOpenChange={(next, details) => request(next, details, true)}
                        >
                            <Tooltip.Trigger delay={triggerHoverDelay} type="button">
                                Paste
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Positioner>
                                    <Tooltip.Popup data-popup="Paste">Paste from clipboard</Tooltip.Popup>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    )}
                </Tooltip.Provider>
            </div>
            <button onClick={() => setOpen(true)} type="button">
                Set open
            </button>
            <button onClick={() => setOpen(false)} type="button">
                Set closed
            </button>
            <button onClick={() => setOpen(undefined)} type="button">
                Release open
            </button>
            <button onClick={() => setDefaultOpen(true)} type="button">
                Set default open
            </button>
            <button
                onClick={() => {
                    cancelNext.current = true;
                }}
                type="button"
            >
                Cancel next request
            </button>
            {initial.interactions && (
                <>
                    <input aria-label="Outside" />
                    <button onClick={() => setDisabled(true)} type="button">
                        Disable root
                    </button>
                    <button onClick={() => setDisabled(false)} type="button">
                        Enable root
                    </button>
                    <button
                        onClick={() => {
                            setProviderDelay(updatedHoverDelay);
                            setProviderCloseDelay(updatedHoverCloseDelay);
                        }}
                        type="button"
                    >
                        Update provider delays
                    </button>
                    <button onClick={() => setPrimaryCloseDelay(triggerHoverCloseDelay)} type="button">
                        Override close delay
                    </button>
                    <button onClick={() => setInstantTimeout(0)} type="button">
                        End instant window
                    </button>
                </>
            )}
            <output data-requests="Copy">{JSON.stringify(requests)}</output>
            <output data-requests="Paste">{JSON.stringify(siblingRequests)}</output>
        </>
    );
}

createRoot(document.getElementById('root')!).render(initial.identity ? <TooltipIdentityFixture /> : <TooltipFixture />);
