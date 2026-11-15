import { Tabs } from '@base-ui/react/tabs';
import { useEffect, useRef, useState } from 'react';
import { classes as s, type installProbe, type Value } from './contract';
import { directionListClass, directionTabClass } from './direction';

export function ReactDirection({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const settings = trace.probe.config;
    const direction = settings.direction!;
    const [options, setOptions] = useState(settings.options);
    const [value, setValue] = useState<Value>(settings.value ?? settings.options[0].value);
    const cancelNext = useRef(direction.kind === 'cancel');
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (!/^F(?:[2-9]|10)$/.test(event.key)) return;
            event.preventDefault();
            if (event.key === 'F2' || event.key === 'F5') setValue(settings.options[1].value);
            if (event.key === 'F3') setValue(settings.options[0].value);
            if (event.key === 'F4') setValue(null);
            if (event.key === 'F6') {
                const next = direction.kind === 'insert-number' ? 0 : 'Account';
                setOptions((options) => [...options, { value: next, label: 'Account' }]);
                setValue(next);
            }
            if (event.key === 'F8')
                setOptions((options) => options.map((option) => ({ ...option, disabled: option.value === value })));
            if (event.key === 'F9') setValue('Missing');
            if (event.key === 'F10') setValue('Unknown');
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, [value, settings, direction]);
    return (
        <>
            <input data-testid="outside" aria-label="Outside tabs" />
            <output data-testid="app-value">{JSON.stringify(value)}</output>
            <Tabs.Root
                className={s.root}
                dir={direction.dir}
                orientation={direction.orientation}
                value={direction.kind === 'fallback' ? undefined : value}
                defaultValue={settings.options[0].value}
                onValueChange={(next, details) => {
                    if (cancelNext.current && details.reason === 'none') {
                        details.cancel();
                        cancelNext.current = false;
                    }
                    trace.change(
                        next,
                        details.reason,
                        details.activationDirection,
                        details.isCanceled,
                        details.event,
                        details.trigger
                    );
                    if (!details.isCanceled) setValue(next);
                }}
                data-testid="tabs-root"
            >
                <Tabs.List
                    className={directionListClass(direction)}
                    aria-label="External selection"
                    data-testid="tablist"
                    data-direction-part
                >
                    {options.map((option) => (
                        <Tabs.Tab
                            key={option.value}
                            className={s.tab + directionTabClass(direction)}
                            value={option.value}
                            disabled={option.disabled}
                            data-testid={`tab-${option.value}`}
                            data-value={JSON.stringify(option.value)}
                            data-direction-part
                        >
                            {option.label}
                        </Tabs.Tab>
                    ))}
                    <Tabs.Indicator className="pointer-events-none absolute" data-testid="indicator" />
                </Tabs.List>
                {options.map((option) => (
                    <Tabs.Panel
                        key={option.value}
                        className={s.panel}
                        value={option.value}
                        keepMounted
                        data-testid={`panel-${option.value}`}
                        data-value={JSON.stringify(option.value)}
                        data-direction-part
                    >
                        Panel {option.label}
                    </Tabs.Panel>
                ))}
            </Tabs.Root>
        </>
    );
}
