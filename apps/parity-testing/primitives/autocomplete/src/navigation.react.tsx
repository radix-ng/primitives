import { Autocomplete } from '@base-ui/react/autocomplete';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { useEffect, useState } from 'react';
import { config, classes as s, type installProbe } from './contract';
import { installKeyProbe, isGrid, navigationItems } from './navigation';
export function ReactNavigation({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const p = config().settings.navigation!;
    const grid = isGrid(p);
    const [items] = useState(() => navigationItems(p));
    const [value, setValue] = useState(p.value ?? '');
    const [readOnly, setReadOnly] = useState(p.readOnly ?? false);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (p.kind === 'read-only' && event.key === 'F2') setReadOnly((value) => !value);
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, [p.kind]);
    const [open, setOpen] = useState(p.initialOpen ?? false);
    useState(() => {
        installKeyProbe();
    });
    const renderItem = (item: string, i: number) => (
        <Autocomplete.Item
            key={item}
            className={s.item}
            value={item}
            index={p.virtualized ? i : undefined}
            disabled={i === p.disabledAt}
            data-testid={`item-${i}`}
        >
            {item}
        </Autocomplete.Item>
    );
    return (
        <DirectionProvider direction={p.dir ?? 'ltr'}>
            <form
                dir={p.dir ?? 'ltr'}
                onSubmit={(event) => {
                    event.preventDefault();
                    trace.probe.submits++;
                }}
            >
                <Autocomplete.Root
                    items={items}
                    grid={grid}
                    virtualized={!!p.virtualized}
                    autoHighlight={p.autoHighlight}
                    loopFocus={p.loop}
                    mode={p.mode ?? 'none'}
                    readOnly={readOnly}
                    filter={p.readOnlyCase === 'preview' ? null : undefined}
                    openOnInputClick={p.opener === 'input'}
                    name="query"
                    value={value}
                    open={open}
                    onValueChange={(value, d) => {
                        trace.change('value', value, d.reason, d.isCanceled, d.event, d.trigger);
                        setValue(value);
                    }}
                    onOpenChange={(open, d) => {
                        trace.change('open', open, d.reason, d.isCanceled, d.event, d.trigger);
                        setOpen(open);
                    }}
                    onItemHighlighted={(value, d) =>
                        trace.probe.highlights.push({ value, index: d.index, reason: d.reason })
                    }
                >
                    <Autocomplete.Input className={s.input} data-testid="input" aria-label="Query" />
                    {(p.opener === 'trigger' || p.opener === 'trigger-key') && (
                        <Autocomplete.Trigger data-testid="trigger">Toggle</Autocomplete.Trigger>
                    )}
                    <Autocomplete.Portal>
                        <Autocomplete.Positioner>
                            <Autocomplete.Popup className={s.popup} data-testid="popup">
                                <Autocomplete.List aria-label="Suggestions" data-testid="list">
                                    {grid
                                        ? [items.slice(0, 3), items.slice(3)].map((row, r) => (
                                              <Autocomplete.Row className="flex gap-2" key={r}>
                                                  {row.map((item, c) => renderItem(item, r * 3 + c))}
                                              </Autocomplete.Row>
                                          ))
                                        : items.map(renderItem)}
                                </Autocomplete.List>
                            </Autocomplete.Popup>
                        </Autocomplete.Positioner>
                    </Autocomplete.Portal>
                </Autocomplete.Root>
                {p.kind === 'read-only' && (
                    <>
                        <output data-testid="committed-value">{value}</output>
                        <button type="submit" data-testid="submit">
                            Submit
                        </button>
                    </>
                )}
            </form>
        </DirectionProvider>
    );
}
