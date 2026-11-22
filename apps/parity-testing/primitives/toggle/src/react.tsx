import { Toggle } from '@base-ui/react/toggle';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initialDefault, initialPressed, installProbe, record } from './contract';

installProbe();

function ToggleFixture() {
    const [defaultPressed, setDefaultPressed] = useState(initialDefault);
    const [pressed, setPressed] = useState<boolean | undefined>(initialPressed);
    const pending = useRef<boolean>(undefined);

    return (
        <>
            <Toggle
                pressed={pressed}
                defaultPressed={defaultPressed}
                onPressedChange={(next, details) => {
                    record(next, details);
                    pending.current = next;
                }}
            >
                Bold
            </Toggle>
            <button onClick={() => setDefaultPressed(!defaultPressed)} type="button">
                Change default
            </button>
            <button onClick={() => setPressed(pending.current)} type="button">
                Apply request
            </button>
            <button onClick={() => setPressed(false)} type="button">
                Set off
            </button>
        </>
    );
}

createRoot(document.getElementById('root')!).render(<ToggleFixture />);
