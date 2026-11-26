import { Tooltip } from '@base-ui/react/tooltip';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { hoverDelay, installFixture, type OpenRequest } from './contract';

const initial = installFixture();

function TooltipFixture() {
    const [open, setOpen] = useState(initial.open);
    const [defaultOpen, setDefaultOpen] = useState(initial.defaultOpen);
    const [requests, setRequests] = useState<OpenRequest[]>([]);
    const cancelNext = useRef(false);

    function request(nextOpen: boolean, details: Tooltip.Root.ChangeEventDetails): void {
        if (cancelNext.current) {
            cancelNext.current = false;
            details.cancel();
        }
        const { reason, isCanceled } = details;
        setRequests((previous) => [...previous, { open: nextOpen, reason, canceled: isCanceled }]);
    }

    return (
        <>
            <Tooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={request}>
                <Tooltip.Trigger delay={hoverDelay} type="button">
                    Copy
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Positioner>
                        <Tooltip.Popup data-popup>Copy to clipboard</Tooltip.Popup>
                    </Tooltip.Positioner>
                </Tooltip.Portal>
            </Tooltip.Root>
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
            <output data-requests>{JSON.stringify(requests)}</output>
        </>
    );
}

createRoot(document.getElementById('root')!).render(<TooltipFixture />);
