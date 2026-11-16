import { Tabs } from '@base-ui/react/tabs';
import { useEffect, useState } from 'react';
import { collectionModel, panelValues } from './collection';
import { classes as s, type installProbe, type Value } from './contract';

export function ReactCollection({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const settings = trace.probe.config.collection!;
    const [step, setStep] = useState(0);
    const [value, setValue] = useState<Value>(1);
    const model = collectionModel(settings, step);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (!['F2', 'F3', 'F4'].includes(event.key)) return;
            event.preventDefault();
            setStep(Number(event.key.slice(1)) - 1);
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    return (
        <>
            <button type="button" data-testid="outside">
                Outside
            </button>
            <Tabs.Root
                className={s.root}
                value={settings.controlled ? value : undefined}
                {...(settings.implicit ? {} : { defaultValue: 1 })}
                orientation={model.orientation}
                dir={model.dir}
                data-testid="tabs-root"
                onValueChange={(next, details) => {
                    if (settings.cancelAutomatic && details.reason !== 'none') details.cancel();
                    if (settings.cancelRequests && details.reason === 'none') details.cancel();
                    trace.change(
                        next,
                        details.reason,
                        details.activationDirection,
                        details.isCanceled,
                        details.event,
                        details.trigger
                    );
                    if (settings.controlled && !details.isCanceled) setValue(next);
                }}
            >
                {model.showList && (
                    <Tabs.List
                        key={model.listKey}
                        className={model.listClass}
                        activateOnFocus={settings.activateOnFocus}
                        aria-label="Dynamic collection"
                        data-testid="tablist"
                    >
                        {model.options.map((option) => (
                            <Tabs.Tab
                                className={s.tab}
                                key={option.key}
                                value={option.value}
                                disabled={option.disabled}
                                data-value={option.value}
                                data-testid={`tab-${option.value}`}
                            >
                                Tab {option.value}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                )}
                {panelValues.map((panel) => (
                    <Tabs.Panel
                        className={s.panel}
                        key={panel}
                        value={panel}
                        keepMounted={!settings.presence}
                        data-value={panel}
                        data-testid={`panel-${panel}`}
                    >
                        Panel {panel}
                    </Tabs.Panel>
                ))}
            </Tabs.Root>
            <button type="button" data-testid="after">
                After
            </button>
        </>
    );
}
