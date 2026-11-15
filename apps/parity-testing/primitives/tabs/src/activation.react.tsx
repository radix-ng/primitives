import { Tabs } from '@base-ui/react/tabs';
import { useState } from 'react';
import { installActivationProbe } from './activation';
import { classes as s, type installProbe } from './contract';

export function ReactActivation({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const p = trace.probe.config.activation!;
    const [activation] = useState(() => installActivationProbe(p));
    const host =
        p.host === 'button' ? (
            <button />
        ) : p.host === 'div' ? (
            <div />
        ) : p.host === 'link' ? (
            <a href="#activated" />
        ) : (
            <a />
        );
    return (
        <>
            <button type="button" data-testid="before">
                Before
            </button>
            <form onSubmit={(event) => activation.submit(event.nativeEvent)}>
                <Tabs.Root
                    className={s.root}
                    defaultValue="zero"
                    data-testid="tabs-root"
                    onValueChange={(value, details) => {
                        if (p.cancel === 'all' || (p.cancel === 'first' && activation.probe.callbacks.length === 0))
                            details.cancel();
                        trace.change(
                            value,
                            details.reason,
                            details.activationDirection,
                            details.isCanceled,
                            details.event,
                            details.trigger
                        );
                        activation.change(
                            value,
                            details.reason,
                            details.activationDirection,
                            details.isCanceled,
                            details.event,
                            details.trigger
                        );
                    }}
                >
                    <Tabs.List className={s.list} activateOnFocus={!!p.secondary} aria-label="Activation tabs">
                        <Tabs.Tab className={s.tab} id="tab-zero" data-testid="tab-0" value="zero">
                            Zero
                        </Tabs.Tab>
                        <Tabs.Tab
                            render={host}
                            nativeButton={p.host === 'button'}
                            className={s.tab}
                            disabled={!!p.disabled}
                            id="tab-one"
                            data-testid="tab-1"
                            value="one"
                        >
                            One{' '}
                            {p.descendant && (
                                <span tabIndex={0} data-testid="child">
                                    Child
                                </span>
                            )}
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="zero" keepMounted>
                        Zero panel
                    </Tabs.Panel>
                    <Tabs.Panel value="one" keepMounted>
                        One panel
                    </Tabs.Panel>
                </Tabs.Root>
            </form>
            <button type="button" data-testid="after">
                After
            </button>
            <div className="h-[2200px]" />
        </>
    );
}
