import { ContextMenu } from '@base-ui/react/context-menu';
import { Menu } from '@base-ui/react/menu';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { menuClasses as s } from '../../../shared/menu-fixture';
import { config, type installProbe, type Layer } from './contract';
import { cancelIndependent } from './independent';

const settings = config();
export function ReactIndependentContextMenu({ trace }: { trace: ReturnType<typeof installProbe> }) {
    const [innerPresent, setInnerPresent] = useState(true);
    const [allow, setAllow] = useState(false);
    const outer = useRef<ContextMenu.Root.Actions | null>(null);
    useEffect(() => {
        const command = (event: KeyboardEvent) => {
            if (!['F3', 'F4', 'F5', 'F6'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'F3' || event.key === 'F4') setInnerPresent(event.key === 'F4');
            if (event.key === 'F5') setAllow(true);
            if (event.key === 'F6') outer.current?.close();
        };
        document.addEventListener('keydown', command);
        return () => document.removeEventListener('keydown', command);
    }, []);
    const change = (owner: Layer, open: boolean, details: Menu.Root.ChangeEventDetails) => {
        if (cancelIndependent(settings.name, owner, open, allow)) details.cancel();
        trace.change(owner, open, details.reason, details.isCanceled, details.event, details.trigger);
    };
    const popup = (owner: 'outer' | 'inner', children?: ReactNode) => (
        <ContextMenu.Portal keepMounted={settings.independent?.retained}>
            <ContextMenu.Positioner className="z-50" side="right" align="start" sideOffset={4}>
                <ContextMenu.Popup
                    id={`${owner}-popup`}
                    data-testid={`${owner}-popup`}
                    data-menu-popup={owner}
                    className={s.popup}
                >
                    <Menu.Item
                        render={<button />}
                        nativeButton
                        className={s.item}
                        data-testid={`${owner}-alpha`}
                        onClick={() => trace.select(`${owner}-alpha`)}
                    >
                        {owner} command
                    </Menu.Item>
                    {children}
                </ContextMenu.Popup>
            </ContextMenu.Positioner>
        </ContextMenu.Portal>
    );
    // A markup function preserves the actual ContextMenu.Root identity across application updates.
    const inner = () =>
        innerPresent && (
            <ContextMenu.Root
                disabled={settings.independent?.innerDisabled}
                onOpenChange={(open, details) => change('inner', open, details)}
                onOpenChangeComplete={(open) => trace.complete('inner', open)}
            >
                <ContextMenu.Trigger
                    tabIndex={0}
                    data-testid="inner-area"
                    data-menu-trigger="inner"
                    className={s.trigger + ' block p-3'}
                >
                    Inner context area
                </ContextMenu.Trigger>
                {popup(
                    'inner',
                    settings.independent?.submenu && (
                        <Menu.SubmenuRoot
                            onOpenChange={(open, details) => change('inner-sub', open, details)}
                            onOpenChangeComplete={(open) => trace.complete('inner-sub', open)}
                        >
                            <Menu.SubmenuTrigger
                                render={<button />}
                                nativeButton
                                className={s.item}
                                data-testid="inner-more"
                            >
                                More
                            </Menu.SubmenuTrigger>
                            <Menu.Portal>
                                <Menu.Positioner className="z-50" side="right" align="start" sideOffset={4}>
                                    <Menu.Popup
                                        id="inner-sub-popup"
                                        data-testid="inner-sub-popup"
                                        data-menu-popup="inner-sub"
                                        className={s.popup}
                                    >
                                        <Menu.Item
                                            render={<button />}
                                            nativeButton
                                            className={s.item}
                                            data-testid="inner-sub-alpha"
                                            onClick={() => trace.select('inner-sub-alpha')}
                                        >
                                            Nested command
                                        </Menu.Item>
                                    </Menu.Popup>
                                </Menu.Positioner>
                            </Menu.Portal>
                        </Menu.SubmenuRoot>
                    )
                )}
            </ContextMenu.Root>
        );
    return (
        <div className={s.layout}>
            <input className={s.outside} data-testid="before" aria-label="Before context menus" />
            <ContextMenu.Root
                actionsRef={outer}
                disabled={settings.independent?.outerDisabled}
                onOpenChange={(open, details) => change('outer', open, details)}
                onOpenChangeComplete={(open) => trace.complete('outer', open)}
            >
                <ContextMenu.Trigger
                    tabIndex={0}
                    data-testid="area"
                    data-menu-trigger="outer"
                    className={s.trigger + ' grid gap-4 p-4'}
                >
                    Outer context area
                    {!settings.independent?.popup && inner()}
                </ContextMenu.Trigger>
                {popup('outer', settings.independent?.popup && inner())}
            </ContextMenu.Root>
            <button
                type="button"
                className={s.outside + ' fixed start-24 top-[30rem]'}
                data-testid="outside"
                onClick={() => trace.probe.activations++}
            >
                Outside
            </button>
        </div>
    );
}
