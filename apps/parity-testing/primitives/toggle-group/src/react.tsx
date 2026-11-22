import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toolbar } from '@base-ui/react/toolbar';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    customItem,
    direction,
    disabledItem,
    initialDefault,
    initialValue,
    installProbe,
    items,
    loopFocus,
    multiple,
    orientation,
    recordGroup,
    recordItem,
    toolbar
} from './contract';

installProbe();

function ToggleGroupFixture() {
    const [defaults, setDefaults] = useState<string[] | undefined>(initialDefault);
    const [controlled, setControlled] = useState<string[] | undefined>(initialValue);
    const [toolbarGroupDisabled, setToolbarGroupDisabled] = useState(false);
    const pending = useRef<readonly string[]>(undefined);

    const group = (
        <ToggleGroup
            value={controlled}
            defaultValue={defaults}
            multiple={multiple}
            loopFocus={loopFocus}
            orientation={orientation}
            onValueChange={(value, details) => {
                recordGroup(value, details);
                pending.current = value;
            }}
            aria-label="Formatting"
        >
            {items.map(({ value, label }) => {
                const custom = customItem && value === 'italic';
                return (
                    <Toggle
                        key={value}
                        value={value}
                        disabled={disabledItem && value === 'italic'}
                        nativeButton={!custom}
                        render={custom ? <span /> : undefined}
                        onPressedChange={(pressed, details) => recordItem(value, pressed, details)}
                    >
                        {label}
                    </Toggle>
                );
            })}
        </ToggleGroup>
    );

    return (
        <DirectionProvider direction={direction}>
            <input aria-label="Before" />
            {toolbar ? (
                <>
                    <Toolbar.Root aria-label="Editing">
                        <Toolbar.Group disabled={toolbarGroupDisabled} aria-label="Choices">
                            {group}
                        </Toolbar.Group>
                        <Toolbar.Button>Copy</Toolbar.Button>
                    </Toolbar.Root>
                    <button onClick={() => setToolbarGroupDisabled(true)} type="button">
                        Disable toolbar group
                    </button>
                </>
            ) : (
                group
            )}
            <button onClick={() => setDefaults(['italic'])} type="button">
                Change default
            </button>
            <button onClick={() => pending.current && setControlled([...pending.current])} type="button">
                Apply request
            </button>
            <button onClick={() => setControlled([])} type="button">
                Clear selection
            </button>
        </DirectionProvider>
    );
}

createRoot(document.getElementById('root')!).render(<ToggleGroupFixture />);
