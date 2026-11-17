import { Button } from '@base-ui/react/button';
import { CompositeItem } from '@base-ui/react/internals/composite/item/CompositeItem';
import { CompositeRoot } from '@base-ui/react/internals/composite/root/CompositeRoot';
import { Toolbar } from '@base-ui/react/toolbar';
import { useEffect } from 'react';
import { classes as s, type Settings, type installProbe } from './contract';

export function ReactInteraction({ settings, trace }: { settings: Settings; trace: ReturnType<typeof installProbe> }) {
    const p = settings.interaction!;
    const focusable = settings.focusableWhenDisabled ?? false;
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
            {...(p.scope === 'toolbar' && !settings.disabled ? {} : { disabled: !!settings.disabled })}
            focusableWhenDisabled={focusable}
            data-testid="subject"
            data-item={p.scope === 'standalone' ? undefined : ''}
            className={s.button}
            {...(p.scope === 'standalone' || p.cancel
                ? {
                      onKeyDown: p.listener === 'native' ? undefined : trace.consume,
                      onKeyUp: p.listener === 'native' ? undefined : trace.consume
                  }
                : {})}
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
                    <CompositeRoot
                        data-testid="collection"
                        disabledIndices={settings.disabled && !focusable ? [1] : []}
                    >
                        <CompositeItem render={<button type="button" />} data-testid="first" data-item>
                            First
                        </CompositeItem>
                        <CompositeItem
                            render={target}
                            metadata={{ disabled: !!settings.disabled, focusableWhenDisabled: focusable }}
                        />
                        <CompositeItem render={<button type="button" />} data-testid="last" data-item>
                            Last
                        </CompositeItem>
                    </CompositeRoot>
                ) : (
                    <Toolbar.Root data-testid="collection" disabled={p.disabledOwner === 'root'} aria-label="Actions">
                        <Toolbar.Button data-testid="first" data-item>
                            First
                        </Toolbar.Button>
                        <Toolbar.Group disabled={p.disabledOwner === 'group'}>
                            <Toolbar.Button
                                render={target}
                                nativeButton={settings.host === 'button'}
                                disabled={!!settings.disabled}
                                focusableWhenDisabled={focusable}
                            />
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
