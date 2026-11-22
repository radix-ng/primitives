import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initialDefault, initialValue, installProbe, recordGroup, recordItem } from './contract';

installProbe();

function ToggleGroupFixture() {
    const [defaults, setDefaults] = useState<string[] | undefined>(initialDefault);
    const [controlled, setControlled] = useState<string[] | undefined>(initialValue);
    const pending = useRef<readonly string[]>(undefined);

    return (
        <>
            <ToggleGroup
                value={controlled}
                defaultValue={defaults}
                onValueChange={(value, details) => {
                    recordGroup(value, details);
                    pending.current = value;
                }}
                aria-label="Formatting"
            >
                <Toggle value="bold" onPressedChange={(pressed, details) => recordItem('bold', pressed, details)}>
                    Bold
                </Toggle>
                <Toggle value="italic" onPressedChange={(pressed, details) => recordItem('italic', pressed, details)}>
                    Italic
                </Toggle>
            </ToggleGroup>
            <button onClick={() => setDefaults(['italic'])} type="button">
                Change default
            </button>
            <button onClick={() => pending.current && setControlled([...pending.current])} type="button">
                Apply request
            </button>
            <button onClick={() => setControlled([])} type="button">
                Clear selection
            </button>
        </>
    );
}

createRoot(document.getElementById('root')!).render(<ToggleGroupFixture />);
