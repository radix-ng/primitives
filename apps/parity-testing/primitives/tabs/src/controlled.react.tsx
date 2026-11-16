import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Tabs } from '@base-ui/react/tabs';
import { useEffect, useRef, useState } from 'react';
import { classes as s, type installProbe } from './contract';
import { controlledCatalog } from './controlled';

export function ReactControlled({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const settings = trace.probe.config.controlled!;
    const [catalog] = useState(() => controlledCatalog(settings));
    const [value, setValue] = useState(() => catalog.initial);
    const pending = useRef<unknown>(undefined);
    const order = [1, 0, 2];
    window.tabsControlled = { catalog, parent: () => value, outputs: [] };
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (!['F2', 'F3', 'F4', 'F6'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F2' && settings.policy === 'delay') setValue(() => pending.current);
            if (event.key === 'F3') setValue(() => catalog.values[0]);
            if (event.key === 'F4') setValue(() => catalog.values[2]);
            if (event.key === 'F6') setValue(() => catalog.values[1]);
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, [catalog, settings.policy]);
    return (
        <DirectionProvider direction={settings.dir ?? 'ltr'}>
            <button type="button" data-testid="outside">
                Outside
            </button>
            <output data-testid="app-value">{catalog.encode(value)}</output>
            <Tabs.Root
                className={s.root}
                value={value}
                orientation={settings.orientation}
                dir={settings.dir}
                data-testid="tabs-root"
                onValueChange={(next, details) => {
                    if (settings.policy === 'cancel') details.cancel();
                    trace.change(
                        next,
                        details.reason,
                        details.activationDirection,
                        details.isCanceled,
                        details.event,
                        details.trigger
                    );
                    if (details.isCanceled) return;
                    if (settings.policy === 'accept') setValue(() => next);
                    if (settings.policy === 'delay') pending.current = next;
                    if (settings.policy === 'replace') setValue(() => catalog.values[2]);
                    if (settings.policy === 'null') setValue(null);
                }}
            >
                <Tabs.List
                    className={'relative flex gap-2' + (settings.orientation === 'vertical' ? ' flex-col' : '')}
                    activateOnFocus={settings.automatic}
                    aria-label="Controlled tabs"
                    data-testid="tablist"
                >
                    {order.map((index) => (
                        <Tabs.Tab
                            className={s.tab}
                            key={index}
                            value={catalog.values[index]}
                            disabled={settings.disabled && index === 0}
                            data-testid={`tab-${index}`}
                        >
                            Tab {index}
                        </Tabs.Tab>
                    ))}
                    <Tabs.Indicator className="absolute top-0 left-0 h-1 w-1" data-testid="indicator" />
                </Tabs.List>
                {order.map((index) => (
                    <Tabs.Panel
                        className={s.panel}
                        key={index}
                        value={catalog.values[index]}
                        keepMounted={!settings.presence}
                        data-testid={`panel-${index}`}
                    >
                        Panel {index}
                    </Tabs.Panel>
                ))}
            </Tabs.Root>
        </DirectionProvider>
    );
}
