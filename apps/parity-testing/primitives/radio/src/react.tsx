import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactRadioCollection } from './collection.react';
import { config, installProbe, options } from './contract';
import { ReactRadioForms } from './forms.react';
import { ReactRadioRefs } from './refs.react';
import { ReactRadioValidation } from './validation.react';

const settings = config();
const probe = installProbe();

function ReactRadio() {
    const bound = settings.value !== undefined;
    const [value, setValue] = useState(settings.value);
    const [defaultValue, setDefaultValue] = useState(settings.defaultValue);
    const pending = useRef<string | null>(null);

    return (
        <DirectionProvider direction={settings.dir ?? 'ltr'}>
            <button type="button" tabIndex={0} data-testid="before">
                Before
            </button>
            <form dir={settings.dir ?? 'ltr'}>
                <RadioGroup
                    value={value}
                    defaultValue={defaultValue}
                    disabled={settings.disabled}
                    readOnly={settings.readOnly}
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
                            <Radio.Root
                                key={option.value}
                                value={option.value}
                                render={<button />}
                                nativeButton
                                data-testid={'radio-' + option.value}
                            >
                                {option.label}
                            </Radio.Root>
                        ) : (
                            <label key={option.value}>
                                <Radio.Root
                                    value={option.value}
                                    disabled={settings.disabledItem === option.value}
                                    data-testid={'radio-' + option.value}
                                    onKeyUp={(event) => {
                                        if (settings.keyboard === 'prevent-space' && event.key === ' ')
                                            event.preventDefault();
                                    }}
                                >
                                    {option.label}
                                    {settings.indicator && (
                                        <Radio.Indicator
                                            data-testid={'indicator-' + option.value}
                                            keepMounted={settings.indicator === 'keep-mounted'}
                                        />
                                    )}
                                </Radio.Root>
                                <span data-testid={'label-' + option.value}>Select</span>
                            </label>
                        )
                    )}
                </RadioGroup>
            </form>
            <button type="button" tabIndex={0} data-testid="after">
                After
            </button>
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
        </DirectionProvider>
    );
}

createRoot(document.getElementById('root')!).render(
    settings.validation ? (
        <ReactRadioValidation />
    ) : settings.refs ? (
        <ReactRadioRefs />
    ) : settings.collection ? (
        <ReactRadioCollection />
    ) : settings.forms ? (
        <ReactRadioForms mode={settings.forms} />
    ) : (
        <ReactRadio />
    )
);
