import { Menu } from '@base-ui/react/menu';
import { useState } from 'react';
import { config, classes as s } from './contract';
import { installHostProbe } from './hosts-probe';
export function ReactHosts() {
    const h = config().host!;
    const [trace] = useState(() => installHostProbe('react'));
    const click = (event: React.MouseEvent) => {
        trace.select('action');
        trace.clicked(event.nativeEvent);
    };
    const action = { className: s.item, 'data-testid': 'action', onClick: click };
    return (
        <div className={s.layout}>
            {h.form && (
                <form
                    id="host-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        window.menuParity.hostSubmissions = (window.menuParity.hostSubmissions ?? 0) + 1;
                    }}
                />
            )}
            <button data-testid="outside">Background</button>
            <Menu.Root
                onOpenChange={(open, e) => trace.change('main', open, e.reason, e.isCanceled, e.event, e.trigger)}
                onOpenChangeComplete={(open) => trace.complete('main', open)}
            >
                <Menu.Trigger className={s.trigger} data-testid="primary">
                    Actions
                </Menu.Trigger>
                <Menu.Portal keepMounted={h.retained}>
                    <Menu.Positioner className="z-50" align="start" sideOffset={4} data-testid="positioner">
                        <Menu.Popup className={s.popup} data-testid="popup">
                            {h.submenu ? (
                                <Menu.SubmenuRoot
                                    onOpenChange={(open, e) =>
                                        trace.change('sub', open, e.reason, e.isCanceled, e.event, e.trigger)
                                    }
                                    onOpenChangeComplete={(open) => trace.complete('sub', open)}
                                >
                                    <Menu.SubmenuTrigger
                                        render={h.tag === 'button' ? <button /> : <div />}
                                        nativeButton={h.tag === 'button'}
                                        className={s.item}
                                        disabled={h.disabled}
                                        data-testid="more"
                                    >
                                        Action
                                    </Menu.SubmenuTrigger>
                                    <Menu.Portal>
                                        <Menu.Positioner className="z-50" side="right" align="start" sideOffset={4}>
                                            <Menu.Popup className={s.popup} data-testid="sub-popup">
                                                <Menu.Item
                                                    render={<button />}
                                                    nativeButton
                                                    className={s.item}
                                                    data-testid="sub-alpha"
                                                    onClick={() => trace.select('sub-alpha')}
                                                >
                                                    Child
                                                </Menu.Item>
                                            </Menu.Popup>
                                        </Menu.Positioner>
                                    </Menu.Portal>
                                </Menu.SubmenuRoot>
                            ) : h.link ? (
                                <Menu.LinkItem {...action} href="#host-target">
                                    Action
                                </Menu.LinkItem>
                            ) : (
                                <Menu.Item
                                    {...action}
                                    closeOnClick={!h.form}
                                    render={
                                        h.tag === 'a' ? (
                                            <a href="#host-target" />
                                        ) : h.tag === 'button' ? (
                                            <button
                                                {...(h.form ? { form: 'host-form' } : {})}
                                                {...(h.submit ? { type: 'submit' as const } : {})}
                                            />
                                        ) : (
                                            <div />
                                        )
                                    }
                                    nativeButton={h.tag === 'button'}
                                    disabled={h.disabled}
                                >
                                    Action
                                </Menu.Item>
                            )}
                            <Menu.Item
                                render={<button />}
                                nativeButton
                                className={s.item}
                                data-testid="alpha"
                                onClick={() => trace.select('alpha')}
                            >
                                Alpha
                            </Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <input data-testid="after" aria-label="After menu" />
        </div>
    );
}
