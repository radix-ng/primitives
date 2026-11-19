import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { config, installProbe, options } from './contract';

const settings = config();
const probe = installProbe();

function ReactRadio() {
    const bound = settings.value !== undefined;
    const [value, setValue] = useState(settings.value);
    const [defaultValue, setDefaultValue] = useState(settings.defaultValue);

    return (
        <>
            <form>
                <RadioGroup
                    value={value}
                    defaultValue={defaultValue}
                    name="density"
                    aria-label="Density"
                    onValueChange={(next, details) => {
                        probe.changes.push({ value: next, reason: details.reason });
                        probe.nativeEvents.push({ type: details.event.type, trusted: details.event.isTrusted });
                        if (probe.cancelNext) {
                            probe.cancelNext = false;
                            details.cancel();
                        } else if (bound) {
                            setValue(next);
                        }
                    }}
                >
                    {options.map((option) => (
                        <Radio.Root key={option.value} value={option.value}>
                            {option.label}
                        </Radio.Root>
                    ))}
                </RadioGroup>
            </form>
            <button
                type="button"
                onClick={() => setDefaultValue((value) => (value === 'standard' ? 'compact' : 'standard'))}
            >
                Change default
            </button>
            {bound && (
                <button type="button" onClick={() => setValue('standard')}>
                    Write value
                </button>
            )}
        </>
    );
}

createRoot(document.getElementById('root')!).render(<ReactRadio />);
