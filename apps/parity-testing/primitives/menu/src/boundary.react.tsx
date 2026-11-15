import { Menu } from '@base-ui/react/menu';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { boundaryClasses as b } from './boundary';
import { config, installProbe, classes as s } from './contract';

type Boundary = Menu.Positioner.Props['collisionBoundary'];

export function ReactBoundary() {
    const settings = config().boundary!;
    const [trace] = useState(() => installProbe('react'));
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);
    const [boundary, setBoundary] = useState<Boundary>();
    const readBoundary = (changed: boolean): Boundary => {
        const first = outer.current!;
        const second = inner.current!;
        const element = changed ? first : second;
        switch (settings.mode) {
            case 'default':
                return undefined;
            case 'clipping':
                return 'clipping-ancestors';
            case 'viewport':
                return [];
            case 'array':
                return changed ? [first] : [first, second];
            case 'mixed':
                return [first, second];
            case 'rect': {
                const rect = element.getBoundingClientRect();
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
            }
            default:
                return element;
        }
    };
    useLayoutEffect(() => {
        setBoundary(readBoundary(false));
        setReady(true);
    }, []);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (settings.dynamic && event.key === 'F3') {
                event.preventDefault();
                setBoundary(readBoundary(true));
            }
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    return (
        <div ref={outer} className={b.outer} data-testid="boundary-outer">
            <div
                ref={inner}
                className={
                    b.inner +
                    (settings.absolute ? '' : ' transform-gpu') +
                    (settings.scaled ? ' origin-top-left scale-90' : '')
                }
                data-testid="boundary-inner"
            >
                {ready && (
                    <div className={b.anchor}>
                        <Menu.Root onOpenChangeComplete={(open) => trace.complete('main', open)}>
                            <Menu.Trigger className={s.trigger} data-testid="primary">
                                Actions
                            </Menu.Trigger>
                            <Menu.Portal container={settings.local ? inner.current : undefined}>
                                <Menu.Positioner
                                    className="z-50"
                                    align="start"
                                    sideOffset={4}
                                    collisionBoundary={boundary}
                                    positionMethod={settings.absolute ? 'absolute' : undefined}
                                    data-testid="positioner"
                                >
                                    <Menu.Popup className={s.popup} data-testid="popup">
                                        <Menu.Item
                                            render={<button />}
                                            nativeButton
                                            className={s.item}
                                            data-testid="alpha"
                                        >
                                            Alpha
                                        </Menu.Item>
                                        <Menu.Item
                                            render={<button />}
                                            nativeButton
                                            className={s.item}
                                            data-testid="bravo"
                                        >
                                            Bravo
                                        </Menu.Item>
                                        <Menu.Item
                                            render={<button />}
                                            nativeButton
                                            className={s.item}
                                            data-testid="omega"
                                        >
                                            Omega
                                        </Menu.Item>
                                    </Menu.Popup>
                                </Menu.Positioner>
                            </Menu.Portal>
                        </Menu.Root>
                    </div>
                )}
            </div>
        </div>
    );
}
