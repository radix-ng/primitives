import { Menu } from '@base-ui/react/menu';
import { useEffect, useRef, useState } from 'react';
import { heldExitClass } from '../../../shared/lifecycle';
import { config, installProbe, classes as s } from './contract';
import { multiTriggerContent } from './triggers';

export function ReactMultiTriggers() {
    const settings = config(),
        p = settings.multiTrigger!;
    const [trace] = useState(() => installProbe('react'));
    const [handle] = useState(() => Menu.createHandle<{ label: string; items: string[] }>());
    const [content, setContent] = useState(multiTriggerContent);
    const [mounted, setMounted] = useState(true),
        [primaryPresent, setPrimaryPresent] = useState(true);
    const [open, setOpen] = useState(false),
        [triggerId, setTriggerId] = useState<string | null>(null);
    const actions = useRef<Menu.Root.Actions | null>(null);
    const previousHold = useRef<(() => void) | undefined>(undefined);
    const closeCount = useRef(0);
    useEffect(() => {
        function command(event: KeyboardEvent) {
            if (!['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F1') actions.current?.unmount();
            if (event.key === 'F2') previousHold.current?.();
            if (event.key === 'F5') setOpen(false);
            if (event.key === 'F3')
                setContent((data) => ({ ...data, primary: { label: 'Updated', items: ['Updated action'] } }));
            if (event.key === 'F4') {
                setMounted((value) => !value);
                setOpen(false);
                setTriggerId(null);
            }
            if (event.key === 'F6') handle.open('secondary');
            if (event.key === 'F7') handle.close();
            if (event.key === 'F8') {
                setTriggerId('secondary');
                setOpen(true);
            }
            if (event.key === 'F9') setTriggerId('primary');
            if (event.key === 'F10') setPrimaryPresent(false);
        }
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, [handle]);
    const triggers = (['primary', 'secondary'] as const).map(
        (id) =>
            (id !== 'primary' || primaryPresent) && (
                <Menu.Trigger
                    key={id}
                    render={<button />}
                    nativeButton
                    className={s.trigger}
                    id={id}
                    data-testid={id}
                    handle={p.detached ? handle : undefined}
                    payload={content[id]}
                    disabled={p.disabled && id === 'secondary'}
                >
                    {content[id].label}
                </Menu.Trigger>
            )
    );
    return (
        <div className={s.layout}>
            <input data-testid="before" aria-label="Before" />
            <input data-testid="outside" aria-label="Outside" />
            {p.detached && <div className="flex gap-2">{triggers}</div>}
            {mounted && (
                <Menu.Root
                    actionsRef={actions}
                    handle={handle}
                    modal={false}
                    open={p.controlled ? open : undefined}
                    triggerId={p.controlled ? triggerId : undefined}
                    defaultOpen={p.defaultOpen}
                    defaultTriggerId={p.defaultOpen ? 'secondary' : undefined}
                    onOpenChange={(next, details) => {
                        if (p.lifecycle && !next && ++closeCount.current === 1) {
                            previousHold.current = details.preventUnmountOnClose;
                            if (p.lifecycle.deferred) details.preventUnmountOnClose();
                        }
                        if (
                            (p.cancelOpen && next) ||
                            (p.cancelClose && !next) ||
                            (p.cancelSwitch && next && handle.isOpen && details.trigger?.id === 'secondary')
                        )
                            details.cancel();
                        trace.change('main', next, details.reason, details.isCanceled, details.event, details.trigger);
                        if (!details.isCanceled && p.controlled) {
                            setOpen(next);
                            if (details.trigger) setTriggerId(details.trigger.id);
                        }
                    }}
                    onOpenChangeComplete={(next) => trace.complete('main', next)}
                >
                    {({ payload }) => (
                        <>
                            {!p.detached && <div className="flex gap-2">{triggers}</div>}
                            <output data-testid="active-payload">{payload?.label ?? ''}</output>
                            <Menu.Portal keepMounted={p.retained}>
                                <Menu.Positioner className="z-50" data-testid="positioner" sideOffset={4} align="start">
                                    <Menu.Popup
                                        className={
                                            s.popup + (p.lifecycle && !p.lifecycle.deferred ? heldExitClass : '')
                                        }
                                        data-testid="popup"
                                    >
                                        <Menu.Viewport
                                            className={
                                                p.animated
                                                    ? 'relative [&>[data-current]]:transition-opacity [&>[data-current]]:duration-[60s] [&>[data-current][data-starting-style]]:opacity-0 [&>[data-previous]]:absolute [&>[data-previous]]:inset-0 [&>[data-previous]]:transition-opacity [&>[data-previous]]:duration-[60s] [&>[data-previous][data-ending-style]]:opacity-0'
                                                    : ''
                                            }
                                            data-testid="viewport"
                                        >
                                            <div className={p.animated ? '' : ''}>
                                                {payload?.items.map((item, index) => (
                                                    <Menu.Item
                                                        key={item}
                                                        render={<button />}
                                                        nativeButton
                                                        className={s.item}
                                                        data-testid={`action-${index}`}
                                                        onClick={() => trace.select(item)}
                                                    >
                                                        {item}
                                                    </Menu.Item>
                                                ))}
                                            </div>
                                        </Menu.Viewport>
                                    </Menu.Popup>
                                </Menu.Positioner>
                            </Menu.Portal>
                        </>
                    )}
                </Menu.Root>
            )}
            <input data-testid="after" aria-label="After" />
        </div>
    );
}
