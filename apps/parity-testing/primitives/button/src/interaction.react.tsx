import { Button } from '@base-ui/react/button';
import { CompositeItem } from '@base-ui/react/internals/composite/item/CompositeItem';
import { CompositeRoot } from '@base-ui/react/internals/composite/root/CompositeRoot';
import { Menu } from '@base-ui/react/menu';
import { Toolbar } from '@base-ui/react/toolbar';
import { useEffect, useState } from 'react';
import { classes as s, type Settings, type installProbe } from './contract';

export function ReactInteraction({ settings, trace }: { settings: Settings; trace: ReturnType<typeof installProbe> }) {
    const p = settings.interaction!;
    const focusable = settings.focusableWhenDisabled ?? false;
    const [menuOpen, setMenuOpen] = useState(false);
    const [disabled, setDisabled] = useState(!!settings.disabled || !!p.disabledOwner);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (!p.disabledHandlers || event.key !== 'F6') return;
            event.preventDefault();
            setDisabled((value) => !value);
        };
        document.addEventListener('keydown', command, true);
        return () => document.removeEventListener('keydown', command, true);
    }, [p]);
    useEffect(() => {
        if (p.listener !== 'native') return;
        const subject = document.querySelector('[data-testid="subject"]')!;
        const consume = (event: Event) => trace.consume(event as KeyboardEvent);
        subject.addEventListener('keydown', consume);
        subject.addEventListener('keyup', consume);
        return () => {
            subject.removeEventListener('keydown', consume);
            subject.removeEventListener('keyup', consume);
        };
    }, [p, trace]);
    const host =
        settings.host === 'button' ? <button /> : settings.host === 'link' ? <a href="#activated" /> : <span />;
    const target = (
        <Button
            render={host}
            nativeButton={settings.host === 'button'}
            {...(p.scope === 'toolbar' && (!settings.disabled || !!p.disabledOwner) ? {} : { disabled })}
            focusableWhenDisabled={focusable}
            data-testid="subject"
            data-item={p.scope === 'standalone' ? undefined : ''}
            className={s.button}
            {...(p.scope === 'standalone' || p.cancel || p.disabledHandlers
                ? {
                      onKeyDown: p.listener === 'native' ? undefined : trace.consume,
                      onKeyUp: p.listener === 'native' ? undefined : trace.consume
                  }
                : {})}
            onPointerDown={p.disabledHandlers ? (event) => trace.probe.handlers.push(event.type) : undefined}
            onMouseDown={p.disabledHandlers ? (event) => trace.probe.handlers.push(event.type) : undefined}
            onClick={(event) => trace.click(event.nativeEvent)}
        >
            Action
        </Button>
    );
    const bareTarget = (
        <Toolbar.Button
            render={host}
            nativeButton={settings.host === 'button'}
            disabled={p.disabledOwner ? false : disabled}
            focusableWhenDisabled={focusable}
            data-testid="subject"
            data-item
            className={s.button}
            onKeyDown={trace.consume}
            onKeyUp={trace.consume}
            onPointerDown={p.disabledHandlers ? (event) => trace.probe.handlers.push(event.type) : undefined}
            onMouseDown={p.disabledHandlers ? (event) => trace.probe.handlers.push(event.type) : undefined}
            onClick={(event) => trace.click(event.nativeEvent)}
        >
            Action
        </Toolbar.Button>
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
                    <Toolbar.Root
                        data-testid="collection"
                        disabled={p.disabledOwner === 'root' && disabled}
                        aria-label="Actions"
                    >
                        <Toolbar.Button data-testid="first" data-item>
                            First
                        </Toolbar.Button>
                        <Toolbar.Group disabled={p.disabledOwner === 'group' && disabled}>
                            {p.menu ? (
                                <Menu.Root onOpenChange={setMenuOpen}>
                                    <Toolbar.Button
                                        render={
                                            <Menu.Trigger nativeButton={settings.host === 'button'} render={host} />
                                        }
                                        nativeButton={settings.host === 'button'}
                                        className={s.button}
                                        data-testid="subject"
                                        data-item
                                    >
                                        Action
                                    </Toolbar.Button>
                                    <output data-testid="menu-open">{String(menuOpen)}</output>
                                </Menu.Root>
                            ) : p.bare ? (
                                bareTarget
                            ) : (
                                <Toolbar.Button
                                    render={target}
                                    nativeButton={settings.host === 'button'}
                                    disabled={p.disabledOwner ? false : disabled}
                                    focusableWhenDisabled={focusable}
                                />
                            )}
                        </Toolbar.Group>
                        <Toolbar.Button data-testid="last" data-item>
                            Last
                        </Toolbar.Button>
                    </Toolbar.Root>
                )}
            </form>
            <button type="button" tabIndex={0} data-testid="after">
                After
            </button>
            <div className="h-[2400px]" />
        </>
    );
}
