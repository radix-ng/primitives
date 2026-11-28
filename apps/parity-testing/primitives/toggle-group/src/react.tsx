import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toolbar } from '@base-ui/react/toolbar';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    authoredValue,
    direction,
    dynamicItems,
    dynamicMultiple,
    generatedValues,
    initialDefault,
    multiple as initialMultiple,
    initialValue,
    installProbe,
    isCustomItem,
    isDisabledItem,
    items,
    loopFocus,
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
    const [toolbarDisabled, setToolbarDisabled] = useState(false);
    const [multiple, setMultiple] = useState(initialMultiple);
    const [options, setOptions] = useState(items);
    const [firstDisabled, setFirstDisabled] = useState(generatedValues);
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
            {options.map(({ value, label }) => {
                const custom = isCustomItem(value);
                return (
                    <Toggle
                        key={value}
                        value={authoredValue(value)}
                        disabled={isDisabledItem(value, firstDisabled)}
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
                    <Toolbar.Root disabled={toolbarDisabled} aria-label="Editing">
                        <Toolbar.Group disabled={toolbarGroupDisabled} aria-label="Choices">
                            {group}
                        </Toolbar.Group>
                        <Toolbar.Button>Copy</Toolbar.Button>
                    </Toolbar.Root>
                    <button onClick={() => setToolbarGroupDisabled(true)} type="button">
                        Disable toolbar group
                    </button>
                    <button
                        onClick={() => {
                            setToolbarGroupDisabled(false);
                            setToolbarDisabled(true);
                        }}
                        type="button"
                    >
                        Disable toolbar
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
            {generatedValues && (
                <button onClick={() => setFirstDisabled(false)} type="button">
                    Enable Bold
                </button>
            )}
            {dynamicMultiple && (
                <button onClick={() => setMultiple((current) => !current)} type="button">
                    Toggle multiple
                </button>
            )}
            {dynamicItems && (
                <>
                    <button onClick={() => setOptions((current) => current.slice().reverse())} type="button">
                        Reverse items
                    </button>
                    <button
                        onClick={() => setOptions((current) => current.filter((item) => item.value !== 'bold'))}
                        type="button"
                    >
                        Remove Bold
                    </button>
                    <button onClick={() => setOptions((current) => [items[0], ...current])} type="button">
                        Restore Bold
                    </button>
                </>
            )}
        </DirectionProvider>
    );
}

createRoot(document.getElementById('root')!).render(<ToggleGroupFixture />);
