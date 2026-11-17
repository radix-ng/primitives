import { Autocomplete } from '@base-ui/react/autocomplete';
import { useEffect, useState } from 'react';
import { config, classes as s, type installProbe } from './contract';
import { installKeyProbe } from './navigation';
import { valueItems } from './value';
export function ReactValueState({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const p = config().settings.valueState!;
    const [value, setValue] = useState(p.value ?? '');
    const [open, setOpen] = useState(true);
    const [mode, setMode] = useState(p.mode ?? 'list');
    useState(() => {
        installKeyProbe();
    });
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (['F2', 'F3', 'F4', 'F5'].includes(event.key)) event.preventDefault();
            if (event.key === 'F2' && p.controlled) setValue('Gamma');
            if (event.key === 'F3' && p.controlled) setValue(' Al ');
            if (event.key === 'F4' && p.controlled) setValue('');
            if (event.key === 'F5') setMode((mode) => (mode === 'list' ? (p.mode ?? 'list') : 'list'));
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, [p]);
    const ownership = p.controlled ? { value } : { defaultValue: p.value ?? '' };
    const options =
        p.kind === 'defaults'
            ? {}
            : { open, mode, autoHighlight: p.autoHighlight ?? false, virtualized: !!p.virtualized };
    return (
        <form onSubmit={(event) => event.preventDefault()}>
            <Autocomplete.Root
                {...ownership}
                {...options}
                items={valueItems}
                name="query"
                onValueChange={(value, d) => {
                    if (p.kind === 'cancel-edit' && d.reason === 'input-change') d.cancel();
                    trace.change('value', value, d.reason, d.isCanceled, d.event, d.trigger);
                    if (!d.isCanceled) setValue(value);
                }}
                onOpenChange={(open, d) => {
                    trace.change('open', open, d.reason, d.isCanceled, d.event, d.trigger);
                    if (!d.isCanceled) setOpen(open);
                }}
            >
                <Autocomplete.Input className={s.input} data-testid="input" aria-label="Query" />
                <span data-testid="display">
                    <Autocomplete.Value />
                </span>
                <Autocomplete.Portal>
                    <Autocomplete.Positioner>
                        <Autocomplete.Popup className={s.popup} data-testid="popup">
                            <Autocomplete.List aria-label="Suggestions">
                                {(item: string, i: number) => (
                                    <Autocomplete.Item
                                        value={item}
                                        key={item}
                                        index={p.virtualized ? i : undefined}
                                        className={s.item}
                                        data-testid={`value-item-${valueItems.indexOf(item)}`}
                                    >
                                        {item}
                                    </Autocomplete.Item>
                                )}
                            </Autocomplete.List>
                        </Autocomplete.Popup>
                    </Autocomplete.Positioner>
                </Autocomplete.Portal>
            </Autocomplete.Root>
            <output data-testid="committed">{value}</output>
            <button type="submit">Submit</button>
        </form>
    );
}
