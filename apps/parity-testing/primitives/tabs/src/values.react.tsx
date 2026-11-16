import { Tabs } from '@base-ui/react/tabs';
import { useEffect, useState } from 'react';
import { classes as s, type installProbe } from './contract';
import { createValues } from './values';

export function ReactValues({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const settings = trace.probe.config.values!;
    const [catalog] = useState(() => createValues(settings));
    const [value, setValue] = useState(() => catalog.initial);
    const [step, setStep] = useState(0);
    const options = step === 1 ? catalog.options.slice(1) : catalog.options;
    window.tabsValues = { catalog };
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (settings.controlled && (event.key === 'F5' || event.key === 'F6')) {
                event.preventDefault();
                setValue(() => catalog.options[event.key === 'F5' ? 2 : 0].value);
                return;
            }
            if (!['F2', 'F3', 'F4'].includes(event.key)) return;
            event.preventDefault();
            setStep(Number(event.key.slice(1)) - 1);
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, [catalog, settings.controlled]);
    return (
        <>
            <button type="button" data-testid="outside">
                Outside
            </button>
            <Tabs.Root
                className={s.root}
                value={settings.controlled ? value : undefined}
                defaultValue={catalog.initial}
                data-testid="tabs-root"
                onValueChange={(next, details) => {
                    if (settings.cancel && details.reason === 'none') details.cancel();
                    trace.change(
                        next,
                        details.reason,
                        details.activationDirection,
                        details.isCanceled,
                        details.event,
                        details.trigger
                    );
                    if (settings.controlled && !details.isCanceled) setValue(() => next);
                }}
            >
                <Tabs.List className="relative flex gap-2" data-testid="tablist" aria-label="Value identities">
                    {options.map((option) => (
                        <Tabs.Tab
                            className={s.tab}
                            key={option.key}
                            value={option.value}
                            disabled={step === 3 && option.key === 'second'}
                            data-testid={`tab-${option.key}`}
                        >
                            {option.key}
                        </Tabs.Tab>
                    ))}
                    <Tabs.Indicator className="absolute top-0 left-0 h-1 w-1" data-testid="indicator" />
                </Tabs.List>
                {catalog.options.map((option) => (
                    <Tabs.Panel
                        className={s.panel}
                        key={option.key}
                        value={option.value}
                        keepMounted={!settings.presence}
                        data-testid={`panel-${option.key}`}
                    >
                        {option.key}
                    </Tabs.Panel>
                ))}
            </Tabs.Root>
        </>
    );
}
