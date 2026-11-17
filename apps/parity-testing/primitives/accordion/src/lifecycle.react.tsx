import { Accordion } from '@base-ui/react/accordion';
import { useEffect, useState } from 'react';
import type { installProbe, Settings } from './contract';

function LifecycleChild() {
    useEffect(() => {
        window.accordionParity.children.created++;
        return () => {
            window.accordionParity.children.destroyed++;
        };
    }, []);
    return <input aria-label="Panel input" defaultValue="initial" />;
}
export function ReactLifecycleAccordion({ s, probe }: { s: Settings; probe: ReturnType<typeof installProbe> }) {
    const mode = s.lifetime;
    const [ids, setIds] = useState(['a', 'b']);
    const [keep, setKeep] = useState(mode === 'retain' || mode === 'override');
    const [overridden, setOverridden] = useState(mode === 'override');
    const [show, setShow] = useState(true);
    const [showPanel, setShowPanel] = useState(true);
    return (
        <>
            <button type="button" data-testid="override" onClick={() => setOverridden(!overridden)}>
                Toggle override
            </button>
            <button type="button" data-testid="keep" onClick={() => setKeep(!keep)}>
                Toggle retention
            </button>
            <button type="button" data-testid="remove-root" onClick={() => setShow(false)}>
                Remove Root
            </button>
            <button type="button" data-testid="reorder" onClick={() => setIds(['b', 'a'])}>
                Reorder
            </button>
            <button type="button" data-testid="remove-a" onClick={() => setIds(['b'])}>
                Remove A
            </button>
            <button type="button" data-testid="toggle-panel" onClick={() => setShowPanel(!showPanel)}>
                Toggle Panel
            </button>
            {show && (
                <Accordion.Root
                    keepMounted={keep}
                    hiddenUntilFound={mode === 'search'}
                    defaultValue={mode === 'reorder' || mode === 'conditional' ? ['a'] : []}
                    onValueChange={(value, details) => probe.request('root', value, details)}
                >
                    {ids.map((id) => (
                        <Accordion.Item
                            key={id}
                            value={id}
                            onOpenChange={(open, details) => probe.request(id, open, details)}
                        >
                            <Accordion.Header>
                                <Accordion.Trigger data-testid={`${id}-trigger`}>{id}</Accordion.Trigger>
                            </Accordion.Header>
                            {showPanel && (
                                <Accordion.Panel
                                    data-testid={`${id}-panel`}
                                    keepMounted={overridden ? false : undefined}
                                >
                                    <LifecycleChild />
                                </Accordion.Panel>
                            )}
                        </Accordion.Item>
                    ))}
                </Accordion.Root>
            )}
        </>
    );
}
