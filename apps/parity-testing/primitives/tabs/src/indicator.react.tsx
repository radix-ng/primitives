import { Tabs } from '@base-ui/react/tabs';
import { useEffect, useState } from 'react';
import type { installProbe } from './contract';
import { indicatorClass, indicatorModel } from './indicator';

export function ReactIndicator({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const [step, setStep] = useState(0);
    const model = indicatorModel(trace.probe.config.indicator!, step);
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
                value={model.value}
                orientation={model.orientation}
                onValueChange={(value, details) =>
                    trace.change(
                        value,
                        details.reason,
                        details.activationDirection,
                        details.isCanceled,
                        details.event,
                        details.trigger
                    )
                }
                data-testid="tabs-root"
            >
                <Tabs.List
                    key={model.listKey}
                    className={model.listClass}
                    aria-label="Indicator tabs"
                    data-testid="tablist"
                >
                    {model.tabs.map((tab) => (
                        <Tabs.Tab
                            key={tab.key}
                            className={tab.className}
                            value={tab.value}
                            data-value={tab.value}
                            data-testid={`tab-${tab.value}`}
                        >
                            {tab.label}
                        </Tabs.Tab>
                    ))}
                    {model.indicators.map((id) => (
                        <Tabs.Indicator key={id} className={indicatorClass} data-testid={`indicator-${id}`} />
                    ))}
                </Tabs.List>
            </Tabs.Root>
        </>
    );
}
