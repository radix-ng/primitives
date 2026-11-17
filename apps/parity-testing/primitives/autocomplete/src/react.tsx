import { Autocomplete } from '@base-ui/react/autocomplete';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { config, installProbe, classes as s } from './contract';
import { ReactNavigation } from './navigation.react';
import { ReactValueState } from './value.react';
const { settings: p } = config();
const trace = installProbe();
function ReactAutocomplete() {
    const [value, setValue] = useState(p.value ?? '');
    const [open, setOpen] = useState(p.open ?? false);
    const [defaultValue, setDefaultValue] = useState(p.defaultValue);
    const [defaultOpen, setDefaultOpen] = useState(p.defaultOpen ?? false);
    const [present, setPresent] = useState(true);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (event.key === 'F2') {
                setDefaultValue('Later');
                setDefaultOpen((value) => !value);
            }
            if (event.key === 'F3') {
                setValue('External');
                setOpen(true);
            }
            if (event.key === 'F4') {
                setValue('');
                setOpen(false);
            }
            if (event.key === 'F5') setPresent(false);
            if (event.key === 'F6') setPresent(true);
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    return (
        <>
            <button type="button" data-testid="before">
                Before
            </button>
            <form>
                {present && (
                    <Autocomplete.Root
                        mode="none"
                        items={['Alpha', 'Beta']}
                        name="query"
                        defaultValue={defaultValue}
                        defaultOpen={defaultOpen}
                        {...(Object.hasOwn(p, 'value') ? { value } : {})}
                        {...(Object.hasOwn(p, 'open') ? { open } : {})}
                        onValueChange={(next, d) => {
                            trace.change('value', next, d.reason, d.isCanceled, d.event, d.trigger);
                            if (Object.hasOwn(p, 'value')) setValue(next);
                        }}
                        onOpenChange={(next, d) => {
                            trace.change('open', next, d.reason, d.isCanceled, d.event, d.trigger);
                            if (Object.hasOwn(p, 'open')) setOpen(next);
                        }}
                    >
                        <div className={s.control}>
                            <Autocomplete.Input className={s.input} data-testid="input" aria-label="Query" />
                            <Autocomplete.Clear data-testid="clear">Clear</Autocomplete.Clear>
                        </div>
                        <Autocomplete.Portal>
                            <Autocomplete.Positioner>
                                <Autocomplete.Popup className={s.popup} data-testid="popup">
                                    <Autocomplete.List aria-label="Suggestions">
                                        <Autocomplete.Item className={s.item} value="Alpha">
                                            Alpha
                                        </Autocomplete.Item>
                                        <Autocomplete.Item className={s.item} value="Beta">
                                            Beta
                                        </Autocomplete.Item>
                                    </Autocomplete.List>
                                </Autocomplete.Popup>
                            </Autocomplete.Positioner>
                        </Autocomplete.Portal>
                    </Autocomplete.Root>
                )}
            </form>
            <output data-testid="default-value">{defaultValue ?? 'omitted'}</output>
            <output data-testid="default-open">{String(defaultOpen)}</output>
        </>
    );
}
createRoot(document.getElementById('root')!).render(
    p.valueState ? (
        <ReactValueState trace={trace} />
    ) : p.navigation ? (
        <ReactNavigation trace={trace} />
    ) : (
        <ReactAutocomplete />
    )
);
