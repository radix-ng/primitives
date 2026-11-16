import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Tabs } from '@base-ui/react/tabs';
import { useEffect, useRef, useState } from 'react';
import { classes as s, type installProbe } from './contract';
import { installKeyboardProbe, keyboardValues } from './keyboard';

export function ReactKeyboard({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const settings = trace.probe.config.keyboard!;
    const [value, setValue] = useState<unknown>(settings.initialNull ? null : 1);
    const pending = useRef<unknown>(undefined);
    useEffect(() => {
        installKeyboardProbe();
        const command = (event: KeyboardEvent) => {
            if (event.key === 'F2' && settings.controlled === 'delay') {
                event.preventDefault();
                setValue(() => pending.current);
            }
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, [settings.controlled]);
    return (
        <DirectionProvider direction={settings.dir ?? 'ltr'}>
            <button type="button" data-testid="outside">
                Before tabs
            </button>
            <Tabs.Root
                className={s.root}
                value={settings.controlled ? value : undefined}
                defaultValue={settings.initialNull ? null : 1}
                orientation={settings.orientation}
                dir={settings.dir}
                data-testid="tabs-root"
                onValueChange={(next, details) => {
                    trace.change(
                        next,
                        details.reason,
                        details.activationDirection,
                        details.isCanceled,
                        details.event,
                        details.trigger
                    );
                    if (settings.controlled === 'accept') setValue(() => next);
                    if (settings.controlled === 'delay') pending.current = next;
                }}
            >
                <Tabs.List
                    className={'flex gap-2' + (settings.orientation === 'vertical' ? ' flex-col' : '')}
                    activateOnFocus={settings.automatic}
                    loopFocus={settings.loop}
                    aria-label="Keyboard tabs"
                    data-testid="tablist"
                >
                    {keyboardValues.map((index) => (
                        <Tabs.Tab
                            className={s.tab}
                            key={index}
                            value={index}
                            disabled={settings.disabled?.includes(index)}
                            data-testid={`tab-${index}`}
                        >
                            Tab {index}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
                {keyboardValues.map((index) => (
                    <Tabs.Panel
                        className="border-border grid h-28 gap-2 rounded border p-3"
                        key={index}
                        value={index}
                        keepMounted={!settings.presence}
                        data-testid={`panel-${index}`}
                    >
                        <label className="flex items-center gap-2">
                            Panel {index}
                            <input className="w-24" data-testid={`input-${index}`} />
                        </label>
                        <button type="button" data-testid={`action-${index}`}>
                            Action {index}
                        </button>
                    </Tabs.Panel>
                ))}
            </Tabs.Root>
            <button type="button" data-testid="after">
                After tabs
            </button>
            <div className="h-[1100px]" aria-hidden="true" />
        </DirectionProvider>
    );
}
