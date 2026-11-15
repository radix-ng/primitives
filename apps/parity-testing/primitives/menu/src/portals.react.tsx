import { Menu } from '@base-ui/react/menu';
import { useEffect, useState } from 'react';
import { config, installProbe, classes as s } from './contract';
import type { PortalSurface } from './portals';

export function ReactPortals({ surface }: { surface: PortalSurface }) {
    const p = config().portal!;
    const [trace] = useState(() => installProbe('react', surface.document));
    const [target, setTarget] = useState(surface.target);
    const [exists, setExists] = useState(true);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (event.key === 'F3') {
                event.preventDefault();
                setTarget(surface.alternate);
            }
            if (event.key === 'F4') {
                event.preventDefault();
                setExists(false);
            }
        };
        surface.document.addEventListener('keydown', command);
        return () => surface.document.removeEventListener('keydown', command);
    }, [surface]);
    return (
        <div className={s.layout}>
            <button className={s.outside} data-testid="outside">
                Background
            </button>
            {exists && (
                <Menu.Root
                    onOpenChange={(open, e) => trace.change('main', open, e.reason, e.isCanceled, e.event, e.trigger)}
                    onOpenChangeComplete={(open) => trace.complete('main', open)}
                >
                    <Menu.Trigger className={s.trigger} data-testid="primary">
                        Actions
                    </Menu.Trigger>
                    <Menu.Portal container={p.ref ? { current: target } : target} keepMounted={p.retained}>
                        <Menu.Positioner className="z-50" data-testid="positioner">
                            <Menu.Popup className={s.popup} data-testid="popup">
                                <Menu.Item
                                    className={s.item}
                                    render={<button />}
                                    nativeButton
                                    onClick={() => trace.select('alpha')}
                                    data-testid="alpha"
                                >
                                    Alpha
                                </Menu.Item>
                                <Menu.Item
                                    className={s.item}
                                    render={<button />}
                                    nativeButton
                                    onClick={() => trace.select('bravo')}
                                    data-testid="bravo"
                                >
                                    Bravo
                                </Menu.Item>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
            )}
        </div>
    );
}
