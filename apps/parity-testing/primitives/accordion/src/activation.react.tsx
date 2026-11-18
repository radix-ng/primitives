import { Accordion } from '@base-ui/react/accordion';
import { useEffect, useRef, useState } from 'react';
import { activationProbe } from './activation-probe';
import type { Settings } from './contract';

export function ReactActivationAccordion({ s, base }: { s: Settings; base: Parameters<typeof activationProbe>[1] }) {
    const [probe] = useState(() => activationProbe(s, base));
    const p = s.activation!;
    const [disabled, setDisabled] = useState(false);
    const trigger = useRef<HTMLElement>(null);
    const interrupted = useRef(false);
    useEffect(() => probe.install(trigger.current!), [probe]);
    const render =
        p.host === 'button' ? (
            <button />
        ) : p.host === 'span' ? (
            <span />
        ) : p.host === 'link' ? (
            <a href="#accordion-activated" />
        ) : (
            <a />
        );
    return (
        <>
            <button type="button" data-testid="before">
                Before
            </button>
            <button type="button" data-testid="enable" onClick={() => setDisabled(false)}>
                Enable
            </button>
            <form onSubmit={probe.submit} onReset={probe.reset}>
                <input data-testid="field" aria-label="Form field" defaultValue="initial" />
                <div onClick={probe.ancestor}>
                    <Accordion.Root
                        keepMounted
                        disabled={disabled && p.owner === 'root'}
                        onValueChange={(value, details) => probe.request('root', value, details)}
                    >
                        <Accordion.Item
                            value="a"
                            disabled={disabled && p.owner === 'item'}
                            onOpenChange={(open, details) => probe.request('a', open, details)}
                        >
                            <Accordion.Header>
                                <Accordion.Trigger
                                    data-testid="a-trigger"
                                    className="inline-block p-4"
                                    ref={trigger}
                                    render={render}
                                    nativeButton={p.host === 'button'}
                                    disabled={disabled && p.owner === 'trigger'}
                                    {...(p.host === 'button' ? { type: p.type ?? 'button' } : {})}
                                    onClick={probe.consume}
                                    onKeyUp={probe.consume}
                                    onPointerDown={probe.consume}
                                    onMouseDown={probe.consume}
                                    onKeyDown={(event) => {
                                        probe.consume(event);
                                        if (p.action === 'disable-held' && event.key === ' ' && !interrupted.current) {
                                            interrupted.current = true;
                                            setDisabled(true);
                                        }
                                    }}
                                >
                                    <span data-testid="a-child" tabIndex={p.action === 'child-key' ? 0 : undefined}>
                                        a
                                    </span>
                                </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Panel data-testid="a-panel">Content a</Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value="b" onOpenChange={(open, details) => probe.request('b', open, details)}>
                            <Accordion.Header>
                                <Accordion.Trigger data-testid="b-trigger">b</Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Panel data-testid="b-panel">Content b</Accordion.Panel>
                        </Accordion.Item>
                    </Accordion.Root>
                </div>
            </form>
            <button type="button" data-testid="after">
                After
            </button>
        </>
    );
}
