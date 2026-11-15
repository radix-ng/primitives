import { Tabs } from '@base-ui/react/tabs';
import { useEffect, useState } from 'react';
import { classes as s, type installProbe, type Value } from './contract';
import { identityCommand, identityParts } from './identity';

export function ReactIdentity({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const kind = trace.probe.config.identity!;
    const roots = kind === 'roots' ? ['a', 'b'] : ['a'];
    const [parts, setParts] = useState(() => identityParts(kind));
    const [values, setValues] = useState<Record<string, Value>>({ a: kind === 'mixed-values' ? 1 : 0, b: 0 });
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (event.key !== 'F2' && event.key !== 'F3') return;
            event.preventDefault();
            setParts((parts) => identityCommand(kind, event.key, parts.tabs, parts.panels));
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, [kind]);
    return (
        <>
            <button type="button" data-testid="outside">
                Outside
            </button>
            {roots.map((root) => (
                <div key={root} className={s.root} data-identity-root={root} data-testid={`root-${root}`}>
                    <Tabs.Root
                        value={values[root]}
                        onValueChange={(value, details) => {
                            trace.change(
                                value,
                                details.reason,
                                details.activationDirection,
                                details.isCanceled,
                                details.event,
                                details.trigger
                            );
                            if (!details.isCanceled) setValues((values) => ({ ...values, [root]: value }));
                        }}
                    >
                        <Tabs.List className="relative flex gap-2" aria-label="Identity tabs">
                            {parts.tabs.map((tab) => (
                                <Tabs.Tab
                                    key={tab.key}
                                    className={s.tab}
                                    value={tab.value}
                                    {...(tab.id ? { id: `${root}-${tab.id}` } : {})}
                                    data-part-key={tab.key}
                                    data-value={JSON.stringify(tab.value)}
                                    data-testid={`${root}-tab-${tab.key}`}
                                >
                                    {root} {tab.key}
                                </Tabs.Tab>
                            ))}
                            {kind === 'indicator' && (
                                <Tabs.Indicator
                                    className="pointer-events-none absolute"
                                    data-testid={`${root}-indicator`}
                                />
                            )}
                        </Tabs.List>
                        {parts.panels.map((panel) => (
                            <Tabs.Panel
                                key={panel.key}
                                className={s.panel}
                                value={panel.value}
                                {...(panel.id ? { id: `${root}-${panel.id}` } : {})}
                                keepMounted={kind !== 'presence'}
                                data-part-key={panel.key}
                                data-value={JSON.stringify(panel.value)}
                                data-testid={`${root}-panel-${panel.key}`}
                            >
                                {kind === 'presence' ? (
                                    <div data-testid={`${root}-content-${panel.key}`}>{panel.key} content</div>
                                ) : (
                                    `${panel.key} content`
                                )}
                            </Tabs.Panel>
                        ))}
                    </Tabs.Root>
                </div>
            ))}
        </>
    );
}
