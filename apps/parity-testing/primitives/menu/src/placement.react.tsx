import { ContextMenu } from '@base-ui/react/context-menu';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Menu } from '@base-ui/react/menu';
import { Menubar } from '@base-ui/react/menubar';
import { useEffect, useState } from 'react';
import { config, installProbe, classes as s } from './contract';

const settings = config();
const p = settings.placement!;

function Popup({ trace }: { trace: ReturnType<typeof installProbe> }) {
    return (
        <Menu.Portal keepMounted={p.switchOrientation}>
            <Menu.Positioner
                className="z-50"
                side={p.side}
                align={p.align}
                sideOffset={p.offset}
                alignOffset={p.offset}
                positionMethod={p.method}
                collisionBoundary={p.boundary ? { x: 0, y: 0, width: 500, height: 600 } : undefined}
                collisionAvoidance={p.viewport ? { side: 'shift', align: 'shift' } : undefined}
                data-testid="positioner"
            >
                <Menu.Popup className={s.popup + (p.fallback ? ' w-[600px]!' : '')} data-testid="popup">
                    <Menu.Item className={s.item} render={<button />} nativeButton data-testid="alpha">
                        Alpha
                    </Menu.Item>
                    {p.nested && (
                        <Menu.SubmenuRoot onOpenChangeComplete={(open) => trace.complete('sub', open)}>
                            <Menu.SubmenuTrigger className={s.item} render={<button />} nativeButton data-testid="more">
                                More
                            </Menu.SubmenuTrigger>
                            <Menu.Portal>
                                <Menu.Positioner
                                    className="z-50"
                                    side={p.override ? 'top' : undefined}
                                    align={p.override ? 'end' : undefined}
                                    sideOffset={p.override ? 9 : undefined}
                                    alignOffset={p.override ? 3 : undefined}
                                    positionMethod={p.method}
                                    data-testid="sub-positioner"
                                >
                                    <Menu.Popup className={s.popup} data-testid="sub-popup">
                                        <Menu.Item
                                            className={s.item}
                                            render={<button />}
                                            nativeButton
                                            data-testid="sub-alpha"
                                        >
                                            Child
                                        </Menu.Item>
                                    </Menu.Popup>
                                </Menu.Positioner>
                            </Menu.Portal>
                        </Menu.SubmenuRoot>
                    )}
                </Menu.Popup>
            </Menu.Positioner>
        </Menu.Portal>
    );
}

export function ReactPlacement() {
    const [trace] = useState(() => installProbe('react'));
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(p.vertical ? 'vertical' : 'horizontal');
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (p.switchOrientation && event.key === 'F3') {
                event.preventDefault();
                setOrientation((value) => (value === 'horizontal' ? 'vertical' : 'horizontal'));
            }
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    const menu = (
        <Menu.Root onOpenChangeComplete={(open) => trace.complete('main', open)}>
            <Menu.Trigger className={s.trigger + ' w-28'} data-testid="primary">
                Actions
            </Menu.Trigger>
            <Popup trace={trace} />
        </Menu.Root>
    );
    return (
        <DirectionProvider direction={settings.dir}>
            <div className={s.layout + (p.viewport ? ' start-[270px]! top-20!' : '')} dir={settings.dir}>
                {p.kind === 'context' ? (
                    <ContextMenu.Root onOpenChangeComplete={(open) => trace.complete('main', open)}>
                        <ContextMenu.Trigger render={<button />} className={s.trigger + ' w-28'} data-testid="primary">
                            Actions
                        </ContextMenu.Trigger>
                        <Popup trace={trace} />
                    </ContextMenu.Root>
                ) : p.kind === 'bar' ? (
                    <Menubar orientation={orientation}>{menu}</Menubar>
                ) : (
                    menu
                )}
            </div>
        </DirectionProvider>
    );
}
