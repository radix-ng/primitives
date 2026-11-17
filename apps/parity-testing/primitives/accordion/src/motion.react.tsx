import { Accordion } from '@base-ui/react/accordion';
import { useState } from 'react';
import type { Settings, installProbe } from './contract';
import './motion.css';
export function ReactMotionAccordion({ s, probe }: { s: Settings; probe: ReturnType<typeof installProbe> }) {
    const [tall, setTall] = useState(false);
    return (
        <>
            <button type="button" data-testid="grow" onClick={() => setTall(!tall)}>
                Change content
            </button>
            <Accordion.Root
                className="motion-root"
                orientation={s.motion === 'horizontal' ? 'horizontal' : 'vertical'}
                defaultValue={s.motion === 'initial' ? ['a'] : []}
                hiddenUntilFound={s.motion === 'search'}
                onValueChange={(value, details) => probe.request('root', value, details)}
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
                        <Accordion.Panel className="motion-panel" data-variant={s.motion} data-testid={`${id}-panel`}>
                            <div className="motion-body" data-tall={tall ? '' : undefined}>
                                Content {id}
                            </div>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
        </>
    );
}
