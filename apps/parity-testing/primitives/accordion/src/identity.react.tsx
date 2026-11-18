import { Accordion } from '@base-ui/react/accordion';
import { useState } from 'react';
import { installProbe, type Settings } from './contract';
import { frozenSelection, identityValues } from './identity.contract';

export function ReactIdentityAccordion({ s, probe }: { s: Settings; probe: ReturnType<typeof installProbe> }) {
    const [values] = useState(() => identityValues(s.identity!, s.multiple ?? false));
    const [rows, setRows] = useState(values.rows);
    const [multiple, setMultiple] = useState(s.multiple ?? false);
    const [controlled, setControlled] = useState(values.initial);
    const [accept, setAccept] = useState(false);
    const actions = [
        'reorder',
        'insert',
        'remove-a',
        'return-a',
        'replace-a',
        'restore-a',
        'external-orphan',
        'external-clear',
        'accept',
        'toggle-multiple'
    ];
    function perform(action: string) {
        switch (action) {
            case 'reorder':
                setRows((rows) => [...rows].reverse());
                break;
            case 'insert':
                setRows((rows) => [values.row('c'), ...rows]);
                break;
            case 'remove-a':
                setRows((rows) => rows.filter((row) => row.id !== 'a'));
                break;
            case 'return-a':
                setRows((rows) => [...rows, values.row('a')]);
                break;
            case 'replace-a':
                setRows((rows) => rows.map((row) => (row.id === 'a' ? { ...row, value: values.replacement } : row)));
                break;
            case 'restore-a':
                setRows((rows) => rows.map((row) => (row.id === 'a' ? values.row('a') : row)));
                break;
            case 'external-orphan':
                setControlled(frozenSelection([values.orphan]));
                break;
            case 'external-clear':
                setControlled(frozenSelection([]));
                break;
            case 'accept':
                setAccept(true);
                break;
            case 'toggle-multiple':
                setMultiple((multiple) => !multiple);
                break;
            default:
                throw new Error(`Unknown identity action: ${action}`);
        }
    }
    return (
        <>
            {actions.map((action) => (
                <button key={action} type="button" data-testid={action} onClick={() => perform(action)}>
                    {action}
                </button>
            ))}
            <Accordion.Root<unknown>
                data-testid="identity-root"
                keepMounted
                multiple={multiple}
                value={s.identity === 'controlled' ? controlled : undefined}
                defaultValue={values.initial}
                onValueChange={(value, details) => {
                    if (probe.request('root', values.labels(value), details) && accept) {
                        setControlled(frozenSelection([...value]));
                    }
                }}
                render={(props, state) => (
                    <div {...props}>
                        <output data-testid="selection">{JSON.stringify(values.labels(state.value))}</output>
                        {props.children}
                    </div>
                )}
            >
                {rows.map((row) => (
                    <Accordion.Item
                        key={row.id}
                        value={row.value}
                        data-testid={`${row.id}-item`}
                        onOpenChange={(open, details) => probe.request(row.id, open, details)}
                    >
                        <Accordion.Header data-testid={`${row.id}-header`}>
                            <Accordion.Trigger data-testid={`${row.id}-trigger`}>{row.id}</Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Panel data-testid={`${row.id}-panel`}>
                            <input aria-label={`${row.id} content`} defaultValue="initial" />
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
                {s.identity === 'fallback' && (
                    <Accordion.Item
                        data-testid="c-item"
                        onOpenChange={(open, details) => probe.request('c', open, details)}
                    >
                        <Accordion.Header data-testid="c-header">
                            <Accordion.Trigger data-testid="c-trigger">c</Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Panel data-testid="c-panel">
                            <input aria-label="c content" defaultValue="initial" />
                        </Accordion.Panel>
                    </Accordion.Item>
                )}
            </Accordion.Root>
        </>
    );
}
