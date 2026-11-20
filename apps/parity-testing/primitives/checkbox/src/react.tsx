import { Checkbox } from '@base-ui/react/checkbox';
import { CheckboxGroup } from '@base-ui/react/checkbox-group';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    group,
    groupDefault,
    initialChecked,
    initialDefault,
    initialGroup,
    installProbe,
    isForm,
    keepMounted,
    mixed,
    record,
    scenario,
    standalonePortal,
    values
} from './contract';

import { ReactCheckboxField } from './field.react';
import { ReactCheckboxPortal } from './portal.react';

const probe = installProbe();

function CheckboxFixture() {
    const [checked, setChecked] = useState(initialChecked);
    const [defaultChecked, setDefaultChecked] = useState(initialDefault);
    const [groupValue, setGroupValue] = useState<string[] | undefined>(initialGroup);
    const [groupDefaultValue, setGroupDefaultValue] = useState(groupDefault);
    const [showB, setShowB] = useState(true);
    const nextChecked = useRef<boolean>(undefined);
    const nextGroup = useRef<string[]>(undefined);

    return (
        <>
            <style>{`
                [data-testid=indicator] { display: inline-block; }
                [data-testid=indicator][data-ending-style] { animation: leave 400ms linear; }
                [data-paused][data-ending-style] { animation-play-state: paused; }
                @keyframes leave { from { opacity: 1; } to { opacity: 0; } }
            `}</style>
            <form
                id="form"
                onKeyDown={(event) => {
                    if (probe.cancelEnter && event.key === 'Enter') event.preventDefault();
                }}
            >
                {group ? (
                    <CheckboxGroup
                        aria-label="Features"
                        value={groupValue}
                        defaultValue={groupDefaultValue}
                        allValues={values}
                        onValueChange={(next, details) => {
                            if (record('group', next, details)) nextGroup.current = next;
                        }}
                    >
                        <Checkbox.Root
                            parent
                            nativeButton
                            render={<button />}
                            onCheckedChange={(next, details) => record('parent', next, details)}
                        >
                            All
                        </Checkbox.Root>
                        {values
                            .filter((value) => value !== 'b' || showB)
                            .map((value) => (
                                <Checkbox.Root
                                    key={value}
                                    nativeButton
                                    render={<button />}
                                    id={'option-' + value}
                                    value={value}
                                    name={scenario === 'group-form' ? 'features' : undefined}
                                    disabled={value === 'b' && scenario === 'group-disabled-child'}
                                    onCheckedChange={(next, details) => record(value, next, details)}
                                >
                                    {value}
                                </Checkbox.Root>
                            ))}
                    </CheckboxGroup>
                ) : (
                    <>
                        <label htmlFor="terms">Terms</label>
                        <Checkbox.Root
                            nativeButton
                            render={<button />}
                            id="terms"
                            name="terms"
                            value="yes"
                            checked={checked}
                            defaultChecked={defaultChecked}
                            indeterminate={mixed}
                            readOnly={scenario === 'readonly'}
                            disabled={scenario === 'disabled'}
                            required={isForm}
                            uncheckedValue={isForm ? 'no' : undefined}
                            onCheckedChange={(next, details) => {
                                if (record('terms', next, details)) nextChecked.current = next;
                            }}
                        >
                            <Checkbox.Indicator
                                keepMounted={keepMounted}
                                data-testid="indicator"
                                data-paused={scenario === 'indicator-lifetime' ? '' : undefined}
                                aria-hidden="true"
                            >
                                ✓
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <button id="submit" type="submit">
                            Submit
                        </button>
                    </>
                )}
            </form>
            <button
                onClick={() => {
                    setDefaultChecked(!defaultChecked);
                    setGroupDefaultValue(['a']);
                }}
            >
                Change default
            </button>
            <button
                onClick={() => {
                    if (group) setGroupValue(nextGroup.current);
                    else setChecked(nextChecked.current);
                }}
            >
                Apply request
            </button>
            <button onClick={() => setShowB(false)}>Remove b</button>
        </>
    );
}

const root = document.getElementById('root');
if (root) {
    createRoot(root).render(
        scenario.startsWith('group-portal') || standalonePortal ? (
            <ReactCheckboxPortal />
        ) : scenario.startsWith('field-') ? (
            <ReactCheckboxField />
        ) : (
            <CheckboxFixture />
        )
    );
}
