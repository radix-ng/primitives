import { Tabs } from '@base-ui/react/tabs';
import { useEffect, useState } from 'react';
import type { installProbe } from './contract';
import { geometryModel } from './geometry';
import { indicatorClass } from './indicator';

export function ReactGeometry({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const [step, setStep] = useState(0);
    const model = geometryModel(trace.probe.config.geometry!, step);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (event.key !== 'F2' && event.key !== 'F3') return;
            event.preventDefault();
            setStep(event.key === 'F2' ? 1 : 2);
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    const tabs = model.tabs.map((tab) => (
        <span className="inline-flex shrink-0 items-start" key={tab.value} data-testid={`slot-${tab.value}`}>
            <Tabs.Tab
                className={tab.className}
                value={tab.value}
                data-value={tab.value}
                data-testid={`tab-${tab.value}`}
            >
                Tab {tab.value}
            </Tabs.Tab>
        </span>
    ));
    return (
        <>
            <button type="button" data-testid="outside">
                Outside
            </button>
            <Tabs.Root
                className={model.frameClass}
                value={model.value}
                orientation={model.orientation}
                dir={model.dir}
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
                <Tabs.List className={model.listClass} data-testid="tablist" aria-label="Indicator geometry">
                    {model.wrapperClass ? (
                        <div className={model.wrapperClass} data-testid="inner">
                            <div className={model.rowClass}>{tabs}</div>
                        </div>
                    ) : (
                        tabs
                    )}
                    <Tabs.Indicator className={indicatorClass} data-testid="indicator" />
                </Tabs.List>
            </Tabs.Root>
        </>
    );
}
