import { Accordion } from '@base-ui/react/accordion';
import { useState } from 'react';
import type { Settings, installProbe } from './contract';
import './search.css';

export function ReactSearchAccordion({ s, probe }: { s: Settings; probe: ReturnType<typeof installProbe> }) {
    const [value, setValue] = useState<unknown[]>([]);
    const [accept, setAccept] = useState(s.acceptControlled ?? false);
    return (
        <>
            <button
                type="button"
                data-testid="allow"
                onClick={() => {
                    s.veto = undefined;
                    setAccept(true);
                }}
            >
                Accept later requests
            </button>
            <div className="search-spacer" />
            <Accordion.Root
                value={s.controlled ? value : undefined}
                hiddenUntilFound
                onValueChange={(next, details) => {
                    if (probe.request('root', next, details) && accept) setValue(next);
                }}
            >
                {['a', 'b'].map((id) => (
                    <Accordion.Item
                        key={id}
                        value={id}
                        onOpenChange={(open, details) => probe.request(id, open, details)}
                    >
                        <Accordion.Header>
                            <Accordion.Trigger data-testid={`${id}-trigger`}>{id}</Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Panel
                            className="search-panel"
                            data-motion={s.search?.motion}
                            data-testid={`${id}-panel`}
                        >
                            <div className="search-body">
                                <span id={`${id}-match`}>Accordion search needle {id}</span>
                                <input data-testid={`${id}-input`} aria-label="Retained value" defaultValue="initial" />
                            </div>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
            <div className="search-spacer" />
        </>
    );
}
