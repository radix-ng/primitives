import { Button } from '@base-ui/react/button';
import { CompositeItem } from '@base-ui/react/internals/composite/item/CompositeItem';
import { CompositeRoot } from '@base-ui/react/internals/composite/root/CompositeRoot';
import { Toolbar } from '@base-ui/react/toolbar';
import { useEffect, useState, type AriaRole } from 'react';
import { config, classes as s, type installProbe } from './contract';

export function ReactAuthored({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const settings = config();
    const p = settings.authored!;
    const [role, setRole] = useState<string | null | undefined>(p.role);
    const [tabIndex, setTabIndex] = useState<number | null | undefined>(p.tabIndex);
    const [disabled, setDisabled] = useState(false);
    const [focusable, setFocusable] = useState(false);
    const [epoch, setEpoch] = useState(0);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (!['F6', 'F7', 'F9', 'F10', 'F11'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F6') setDisabled((value) => !value);
            if (event.key === 'F7') setFocusable((value) => !value);
            if (event.key === 'F9') {
                setRole('option');
                setTabIndex(0);
            }
            if (event.key === 'F10') {
                setRole(null);
                setTabIndex(null);
            }
            if (event.key === 'F11') {
                setRole(undefined);
                setTabIndex(undefined);
            }
            setEpoch((value) => value + 1);
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    // Null deliberately removes a React DOM attribute; omitted props restore useButton defaults.
    const props = {
        ...(role !== undefined ? { role: role as AriaRole } : {}),
        ...(tabIndex !== undefined ? { tabIndex: tabIndex as number } : {})
    };
    const host =
        settings.host === 'button' ? <button /> : settings.host === 'link' ? <a href="#activated" /> : <span />;
    const target = (
        <Button
            render={host}
            nativeButton={settings.host === 'button'}
            {...props}
            disabled={disabled}
            focusableWhenDisabled={focusable}
            className={s.button}
            data-testid="subject"
            data-item={p.scope === 'standalone' ? undefined : ''}
            onKeyDown={(event) => {
                if (p.action === 'role-space' && event.key === ' ') event.preventDefault();
            }}
            onClick={(event) => trace.click(event.nativeEvent)}
        >
            Action
        </Button>
    );
    return (
        <>
            <button type="button" tabIndex={0} data-testid="before">
                Before
            </button>
            <form className={s.form} onSubmit={(event) => trace.submit(event.nativeEvent)}>
                <input data-testid="field" defaultValue="initial" aria-label="Form field" />
                {p.scope === 'standalone' ? (
                    target
                ) : p.scope === 'composite' ? (
                    <CompositeRoot data-testid="collection" disabledIndices={disabled && !focusable ? [1] : []}>
                        <CompositeItem render={<button type="button" />} data-testid="first" data-item>
                            First
                        </CompositeItem>
                        <CompositeItem render={target} metadata={{ disabled, focusableWhenDisabled: focusable }} />
                        <CompositeItem render={<button type="button" />} data-testid="last" data-item>
                            Last
                        </CompositeItem>
                    </CompositeRoot>
                ) : (
                    <Toolbar.Root data-testid="collection" aria-label="Actions">
                        <Toolbar.Button data-testid="first" data-item>
                            First
                        </Toolbar.Button>
                        <Toolbar.Button
                            render={target}
                            nativeButton={settings.host === 'button'}
                            disabled={disabled}
                            focusableWhenDisabled={focusable}
                        />
                        <Toolbar.Button data-testid="last" data-item>
                            Last
                        </Toolbar.Button>
                    </Toolbar.Root>
                )}
            </form>
            <button type="button" tabIndex={0} data-testid="after">
                After
            </button>
            <output data-testid="epoch">{epoch}</output>
        </>
    );
}
