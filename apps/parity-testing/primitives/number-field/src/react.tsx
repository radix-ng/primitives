import { NumberField } from '@base-ui/react/number-field';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { config, installProbe } from './contract';

const settings = config();
const probe = installProbe();

function ReactNumberField() {
    const bound = settings.value !== undefined;
    const [value, setValue] = useState<number | null | undefined>(settings.value);
    const [defaultValue, setDefaultValue] = useState<number | undefined>(settings.defaultValue);

    return (
        <>
            <form>
                <NumberField.Root
                    name="amount"
                    value={value}
                    defaultValue={defaultValue}
                    onValueChange={(next, details) => {
                        probe.changes.push({ value: next, reason: details.reason });
                        probe.nativeEvents.push({ type: details.event.type, trusted: details.event.isTrusted });
                        if (bound) setValue(next);
                    }}
                    onValueCommitted={(next) => probe.commits.push(next)}
                >
                    <NumberField.Input aria-label="Amount" />
                </NumberField.Root>
            </form>
            <button type="button" onClick={() => setDefaultValue((previous) => (previous ?? 0) + 40)}>
                Change default
            </button>
            {bound && (
                <button type="button" onClick={() => setValue(8)}>
                    Write value
                </button>
            )}
        </>
    );
}

createRoot(document.getElementById('root')!).render(<ReactNumberField />);
