import { Button } from '@base-ui/react/button';
import { Toggle } from '@base-ui/react/toggle';
import { Toolbar } from '@base-ui/react/toolbar';
import { useEffect, useState } from 'react';
import { config, classes as s, type installProbe } from './contract';
import type { ToggleChange } from './toggle';

export function ReactToggle({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const settings = config();
    const p = settings.toggle!;
    const [disabled, setDisabled] = useState(p.action === 'disabled');
    const [focusable, setFocusable] = useState(p.focusable ?? true);
    const [epoch, setEpoch] = useState(0);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (p.action !== 'disabled' || !['F6', 'F7'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F6') setDisabled((value) => !value);
            else setFocusable((value) => !value);
            setEpoch((value) => value + 1);
        };
        document.addEventListener('keydown', command, true);
        return () => document.removeEventListener('keydown', command, true);
    }, [p]);
    const [changes, setChanges] = useState<ToggleChange[]>([]);
    const native = settings.host === 'button';
    const host = native ? <button /> : <span />;
    const toggle = (
        <Toggle
            nativeButton={native}
            {...(p.disabledOwner === 'self' ? { disabled } : {})}
            render={p.stacked ? <Button nativeButton={native} render={host} /> : host}
            onKeyDown={(event) => {
                if (
                    (p.action === 'prevent-enter' && event.key === 'Enter') ||
                    (p.action === 'prevent-space' && event.key === ' ')
                )
                    event.preventDefault();
            }}
            onPressedChange={(pressed, details) => {
                const event = details.event as MouseEvent;
                setChanges((values) => [
                    ...values,
                    {
                        pressed,
                        type: event.type,
                        reason: details.reason,
                        trusted: event.isTrusted,
                        shift: !!event.shiftKey,
                        ctrl: !!event.ctrlKey
                    }
                ]);
                if (p.action === 'cancel-change') details.cancel();
            }}
            onClick={(event) => trace.click(event.nativeEvent)}
        />
    );
    return (
        <>
            <button type="button" tabIndex={0} data-testid="before">
                Before
            </button>
            <form className={s.form} onSubmit={(event) => trace.submit(event.nativeEvent)}>
                <input data-testid="field" defaultValue="initial" aria-label="Form field" />
                <Toolbar.Root
                    disabled={p.disabledOwner === 'root' && disabled}
                    data-testid="collection"
                    aria-label="Formatting"
                >
                    <Toolbar.Button data-testid="first" data-item>
                        First
                    </Toolbar.Button>
                    <Toolbar.Group disabled={p.disabledOwner === 'group' && disabled}>
                        <Toolbar.Button
                            disabled={p.disabledOwner === 'self' && disabled}
                            focusableWhenDisabled={focusable}
                            render={toggle}
                            nativeButton={native}
                            className={s.button}
                            data-testid="subject"
                            data-item
                        >
                            Bold
                        </Toolbar.Button>
                    </Toolbar.Group>
                    <Toolbar.Button data-testid="last" data-item>
                        Last
                    </Toolbar.Button>
                </Toolbar.Root>
            </form>
            <button type="button" tabIndex={0} data-testid="after">
                After
            </button>
            <output data-testid="toggle-epoch">{epoch}</output>
            <output data-testid="toggle-changes">{JSON.stringify(changes)}</output>
            {p.action !== 'disabled' && <div className="h-[2400px]"></div>}
        </>
    );
}
