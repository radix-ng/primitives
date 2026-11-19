import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { config, installProbe, options } from './contract';

const settings = config();
const probe = installProbe();

function ReactRadio() {
    const bound = settings.value !== undefined;
    const [value, setValue] = useState(settings.value);
    const [defaultValue, setDefaultValue] = useState(settings.defaultValue);
    const pending = useRef<string | null>(null);

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
                        if (probe.cancelNext || settings.response === 'cancel') {
                            probe.cancelNext = false;
                            details.cancel();
                        } else if (settings.response === 'delay') {
                            pending.current = next;
                        } else if (settings.response === 'replace') {
                            setValue('');
                        } else if (settings.response === 'clear') {
                            setValue(null);
                        } else if (settings.response === 'ignore') {
                            return;
                        } else if (bound) {
                            setValue(next);
                        }
                    }}
                >
                    {options.map((option) =>
                        settings.nativeButton ? (
                            <Radio.Root key={option.value} value={option.value} render={<button />} nativeButton>
                                {option.label}
                            </Radio.Root>
                        ) : (
                            <label key={option.value}>
                                <Radio.Root value={option.value}>{option.label}</Radio.Root>
                                <span data-testid={'label-' + option.value}>Select</span>
                            </label>
                        )
                    )}
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
            {settings.response === 'delay' && (
                <button type="button" onClick={() => setValue(pending.current)}>
                    Apply request
                </button>
            )}
        </>
    );
}

createRoot(document.getElementById('root')!).render(<ReactRadio />);
